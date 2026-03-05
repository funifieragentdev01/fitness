public Object handle(Object payload) {
    Map response = new HashMap()

    String idToken = payload.get("id_token")
    if (idToken == null || idToken.trim().isEmpty()) {
        response.put("status", "ERROR")
        response.put("message", "id_token obrigatorio")
        return response
    }

    // 1. Verify Google token
    String tokenUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + java.net.URLEncoder.encode(idToken, "UTF-8")
    def googleConn = new java.net.URL(tokenUrl).openConnection()
    googleConn.setRequestMethod("GET")
    googleConn.setConnectTimeout(4000)
    googleConn.setReadTimeout(4000)

    int googleStatus = googleConn.getResponseCode()
    if (googleStatus != 200) {
        response.put("status", "ERROR")
        response.put("message", "Token Google invalido")
        return response
    }

    String googleBody = googleConn.getInputStream().getText("UTF-8")
    Map googleData = parseJson(googleBody)

    String email = googleData.get("email")
    String name = googleData.get("name") != null ? googleData.get("name") : email
    String googleSub = googleData.get("sub")
    String picture = googleData.get("picture")

    if (email == null || email.trim().isEmpty()) {
        response.put("status", "ERROR")
        response.put("message", "Email nao encontrado no token Google")
        return response
    }

    // Verify audience
    String expectedClientId = "141440257053-8mabofaof1ksc8d6r5qha79t4pf7tq8r.apps.googleusercontent.com"
    String aud = googleData.get("aud")
    if (!expectedClientId.equals(aud)) {
        response.put("status", "ERROR")
        response.put("message", "Token audience invalido")
        return response
    }

    // 2. Check if player exists
    def pm = manager.getPlayerManager()
    def player = pm.findById(email)
    boolean isNewUser = (player == null)

    // Deterministic password for Google users
    String internalPwd = "goo_" + googleSub + "_orvya2026"
    String apiKey = manager.getApiKey()

    if (isNewUser) {
        // Create via signup__c trigger (which BCrypt-hashes password)
        String basicToken = java.util.Base64.getEncoder().encodeToString((apiKey + ":").getBytes("UTF-8"))
        String signupBody = "{\"_id\":\"" + email + "\",\"name\":\"" + escapeJson(name) + "\",\"email\":\"" + email + "\",\"password\":\"" + internalPwd + "\"}"

        def signupConn = new java.net.URL("https://service2.funifier.com/v3/database/signup__c").openConnection()
        signupConn.setRequestMethod("PUT")
        signupConn.setDoOutput(true)
        signupConn.setConnectTimeout(4000)
        signupConn.setReadTimeout(4000)
        signupConn.setRequestProperty("Content-Type", "application/json")
        signupConn.setRequestProperty("Authorization", "Basic " + basicToken)
        signupConn.getOutputStream().write(signupBody.getBytes("UTF-8"))

        int signupStatus = signupConn.getResponseCode()
        if (signupStatus != 200 && signupStatus != 201) {
            response.put("status", "ERROR")
            response.put("message", "Erro ao criar conta: " + signupStatus)
            return response
        }

        // Set extra fields (authProvider, plan) on the new player
        def newPlayer = pm.findById(email)
        if (newPlayer != null) {
            Map extra = newPlayer.extra
            if (extra == null) { extra = new HashMap() }
            Map plan = new HashMap()
            plan.put("type", "standard")
            Map changes = new HashMap()
            changes.put("mealPlan", 0)
            changes.put("workoutPlan", 0)
            changes.put("goal", 0)
            changes.put("bodyCheckin", 0)
            changes.put("bioReport", 0)
            changes.put("lastReset", new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()))
            plan.put("changesUsed", changes)
            extra.put("plan", plan)
            extra.put("authProvider", "google")
            extra.put("googleSub", googleSub)
            if (picture != null) { extra.put("googlePicture", picture) }
            newPlayer.extra = extra
            pm.insert(newPlayer)
        }
    } else {
        // Existing player - update extra and reset password
        Map extra = player.extra
        if (extra == null) { extra = new HashMap() }
        if (extra.get("authProvider") == null) {
            extra.put("authProvider", "google")
            extra.put("googleSub", googleSub)
        }
        if (picture != null) { extra.put("googlePicture", picture) }
        player.extra = extra
        pm.insert(player)

        // Re-create via signup to update BCrypt password
        String basicToken = java.util.Base64.getEncoder().encodeToString((apiKey + ":").getBytes("UTF-8"))
        String signupBody = "{\"_id\":\"" + email + "\",\"name\":\"" + escapeJson(player.name) + "\",\"email\":\"" + email + "\",\"password\":\"" + internalPwd + "\"}"
        def signupConn = new java.net.URL("https://service2.funifier.com/v3/database/signup__c").openConnection()
        signupConn.setRequestMethod("PUT")
        signupConn.setDoOutput(true)
        signupConn.setConnectTimeout(4000)
        signupConn.setReadTimeout(4000)
        signupConn.setRequestProperty("Content-Type", "application/json")
        signupConn.setRequestProperty("Authorization", "Basic " + basicToken)
        signupConn.getOutputStream().write(signupBody.getBytes("UTF-8"))
        signupConn.getResponseCode()
    }

    // 3. Get Funifier auth token
    String authBody = "{\"apiKey\":\"" + apiKey + "\",\"grant_type\":\"password\",\"username\":\"" + email + "\",\"password\":\"" + internalPwd + "\"}"
    def authConn = new java.net.URL("https://service2.funifier.com/v3/auth/token").openConnection()
    authConn.setRequestMethod("POST")
    authConn.setDoOutput(true)
    authConn.setConnectTimeout(4000)
    authConn.setReadTimeout(4000)
    authConn.setRequestProperty("Content-Type", "application/json")
    authConn.getOutputStream().write(authBody.getBytes("UTF-8"))

    int authStatus = authConn.getResponseCode()
    if (authStatus != 200) {
        response.put("status", "ERROR")
        response.put("message", "Erro auth: " + authStatus)
        return response
    }

    String authResponseBody = authConn.getInputStream().getText("UTF-8")
    Map authData = parseJson(authResponseBody)

    response.put("status", "OK")
    response.put("access_token", authData.get("access_token"))
    response.put("username", email)
    response.put("name", name)
    response.put("isNewUser", isNewUser)
    return response
}

String escapeJson(String s) {
    if (s == null) { return "" }
    return s.replace("\\", "\\\\").replace("\"", "\\\"")
}

Map parseJson(String json) {
    Map r = new HashMap()
    String clean = json.trim()
    if (clean.startsWith("{")) { clean = clean.substring(1) }
    if (clean.endsWith("}")) { clean = clean.substring(0, clean.length() - 1) }
    List parts = new ArrayList()
    StringBuilder current = new StringBuilder()
    boolean inQuote = false
    boolean escaped = false
    int ci = 0
    while (ci < clean.length()) {
        char c = clean.charAt(ci)
        if (escaped) { current.append(c); escaped = false; ci++; continue }
        if (c == (char)'\\') { escaped = true; current.append(c); ci++; continue }
        if (c == (char)'"') { inQuote = !inQuote }
        else if (c == (char)',' && !inQuote) {
            parts.add(current.toString())
            current = new StringBuilder()
            ci++
            continue
        }
        current.append(c)
        ci++
    }
    if (current.length() > 0) { parts.add(current.toString()) }
    int pi = 0
    while (pi < parts.size()) {
        String part = parts.get(pi)
        int colonIdx = part.indexOf(":")
        if (colonIdx > 0) {
            String key = part.substring(0, colonIdx).trim().replace("\"", "")
            String val = part.substring(colonIdx + 1).trim()
            if (val.startsWith("\"") && val.endsWith("\"")) {
                val = val.substring(1, val.length() - 1)
            }
            if (val.equals("null")) { val = null }
            r.put(key, val)
        }
        pi++
    }
    return r
}
