public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();

    String idToken = (String) payload.get("id_token");
    if (idToken == null || idToken.trim().isEmpty()) {
        response.put("status", "ERROR");
        response.put("message", "id_token obrigatorio");
        return response;
    }

    // 1. Verify Google token
    def googleRes = com.mashape.unirest.http.Unirest.get("https://oauth2.googleapis.com/tokeninfo")
        .queryString("id_token", idToken)
        .asString();

    if (googleRes.getStatus() != 200) {
        response.put("status", "ERROR");
        response.put("message", "Token Google invalido");
        return response;
    }

    Map googleData = com.funifier.util.JsonUtil.fromJsonToMap(googleRes.getBody());

    String email = (String) googleData.get("email");
    String name = googleData.get("name") != null ? (String) googleData.get("name") : email;
    String googleSub = (String) googleData.get("sub");
    String picture = (String) googleData.get("picture");

    if (email == null || email.trim().isEmpty()) {
        response.put("status", "ERROR");
        response.put("message", "Email nao encontrado no token Google");
        return response;
    }

    // Verify token audience matches our client ID
    String expectedClientId = "141440257053-8mabofaof1ksc8d6r5qha79t4pf7tq8r.apps.googleusercontent.com";
    String aud = (String) googleData.get("aud");
    if (!expectedClientId.equals(aud)) {
        response.put("status", "ERROR");
        response.put("message", "Token audience invalido");
        return response;
    }

    // 2. Check if player exists
    def pm = manager.getPlayerManager();
    def player = pm.findById(email);
    boolean isNewUser = (player == null);

    // Internal password for Google users (deterministic, not guessable)
    String internalPwd = "goo_" + googleSub + "_orvya2026";
    String hashedPwd = org.mindrot.jbcrypt.BCrypt.hashpw(internalPwd, org.mindrot.jbcrypt.BCrypt.gensalt());

    if (isNewUser) {
        // Create new player
        def newPlayer = new Player();
        newPlayer._id = email;
        newPlayer.name = name;
        newPlayer.email = email;
        newPlayer.password = hashedPwd;
        Map extra = new HashMap();
        Map plan = new HashMap();
        plan.put("type", "standard");
        Map changes = new HashMap();
        changes.put("mealPlan", 0);
        changes.put("workoutPlan", 0);
        changes.put("goal", 0);
        changes.put("bodyCheckin", 0);
        changes.put("bioReport", 0);
        changes.put("lastReset", new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        plan.put("changesUsed", changes);
        extra.put("plan", plan);
        extra.put("authProvider", "google");
        extra.put("googleSub", googleSub);
        if (picture != null) extra.put("googlePicture", picture);
        newPlayer.extra = extra;
        pm.insert(newPlayer);
    } else {
        // Player exists -- update Google info
        Map extra = player.extra;
        if (extra == null) extra = new HashMap();
        if (extra.get("authProvider") == null) {
            extra.put("authProvider", "google");
            extra.put("googleSub", googleSub);
        }
        if (picture != null) extra.put("googlePicture", picture);
        player.extra = extra;
        player.password = hashedPwd;
        pm.insert(player);
    }

    // 3. Get Funifier auth token
    String apiKey = manager.getApiKey();
    Map authPayload = new HashMap();
    authPayload.put("apiKey", apiKey);
    authPayload.put("grant_type", "password");
    authPayload.put("username", email);
    authPayload.put("password", internalPwd);
    String authBody = com.funifier.util.JsonUtil.toJson(authPayload);

    def authRes = com.mashape.unirest.http.Unirest.post("https://service2.funifier.com/v3/auth/token")
        .header("Content-Type", "application/json")
        .body(authBody)
        .asString();

    if (authRes.getStatus() != 200) {
        response.put("status", "ERROR");
        response.put("message", "Erro ao gerar token de acesso");
        return response;
    }

    Map authData = com.funifier.util.JsonUtil.fromJsonToMap(authRes.getBody());

    response.put("status", "OK");
    response.put("access_token", authData.get("access_token"));
    response.put("username", email);
    response.put("name", name);
    response.put("isNewUser", isNewUser);
    return response;
}
