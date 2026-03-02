public Object handle(Object payload) {
    def result = [:]
    def body = (Map) payload
    def playerId = body.get("player_id")
    if (!playerId) { result.put("error", "player_id required"); return result }

    def player = manager.getPlayerManager().findById(playerId.toString())
    if (!player) { result.put("error", "player not found"); return result }

    // OpenAI config
    // Replace YOUR_OPENAI_KEY with actual key when deploying via API
    def openaiKey = "YOUR_OPENAI_KEY"
    result.put("api_key", openaiKey)
    result.put("model", "gpt-realtime-mini")
    result.put("voice", "coral")

    // Player info
    result.put("player_name", player.name ?: "Amigo")
    def extra = player.extra ?: [:]
    result.put("player_plan", extra.get("plan") ?: [:])

    def jongo = manager.getJongoConnection()

    // Get profile from profile__c (uses _id = playerId)
    try {
        def profile = jongo.getCollection("profile__c")
            .findOne("{_id: #}", playerId.toString())
            .as(java.util.Map.class)
        if (profile != null) {
            result.put("profile", profile)
        }
    } catch (Exception e) {
        result.put("profile_error", e.getMessage())
    }

    // Get latest body checkin (uses player field)
    try {
        def it = jongo.getCollection("body_checkin__c")
            .find("{player: #}", playerId.toString())
            .sort("{_created: -1}")
            .limit(1)
            .as(java.util.Map.class)
        if (it.hasNext()) {
            result.put("latest_checkin", it.next())
        }
    } catch (Exception e) {
        // Try with _id
        try {
            def it2 = jongo.getCollection("body_checkin__c")
                .find("{_id: {" + String.valueOf((char)0x24) + "regex: #}}", playerId.toString())
                .sort("{_created: -1}")
                .limit(1)
                .as(java.util.Map.class)
            if (it2.hasNext()) {
                result.put("latest_checkin", it2.next())
            }
        } catch (Exception e2) {
            result.put("checkin_error", e2.getMessage())
        }
    }

    return result
}
