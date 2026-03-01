public Object handle(Object payload) {
    def result = [:]
    def body = (Map) payload

    def playerId = body.get("player_id")
    if (!playerId) {
        result.put("error", "player_id required")
        return result
    }

    // Get player data for context
    def player = manager.getPlayerManager().findById(playerId.toString())
    if (!player) {
        result.put("error", "player not found")
        return result
    }

    // Return the API key for client-side ephemeral key generation
    // The frontend will call OpenAI directly to get the ephemeral key
    // OpenAI key stored in Funifier config - replace YOUR_OPENAI_KEY with actual key in Studio
    def openaiKey = "YOUR_OPENAI_KEY"

    result.put("api_key", openaiKey)
    result.put("model", "gpt-realtime-mini")
    result.put("voice", "coral")
    result.put("player_name", player.name ?: "Amigo")

    // Include player context for the system prompt
    def extra = player.extra ?: [:]
    def profile = [:]
    if (extra.containsKey("profile")) {
        profile = (Map) extra.get("profile")
    }
    result.put("player_profile", profile)
    result.put("player_plan", extra.get("plan") ?: [:])

    return result
}
