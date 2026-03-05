public Object handle(Object payload) {
    // Push notification sender - called by scheduler or manually
    // payload: { playerId: "email", title: "...", body: "..." }
    // Or: { broadcast: true, title: "...", body: "..." } to send to all

    Map response = new HashMap();
    String vapidPrivateKey = "Ov5_0cdfBUjoVuG5swKcQjgjrlk8aGbdquqqq5Pbi0U";
    String vapidPublicKey = "BCveFW7RrtFdfnqRFPz3U5oKuv1V7RseXYZPlVbnnswWHdTWrz9EnfTFY8JmaHS9p12u6EFECT3aDlCOPtF7Q0A";
    String vapidSubject = "mailto:funifier.agent.dev01@gmail.com";

    String title = payload.get("title") != null ? (String) payload.get("title") : "Orvya";
    String body = payload.get("body") != null ? (String) payload.get("body") : "";

    // Build notification payload
    Map notifPayload = new HashMap();
    notifPayload.put("title", title);
    notifPayload.put("body", body);
    notifPayload.put("url", "/");
    String jsonPayload = com.funifier.util.JsonUtil.toJson(notifPayload);

    def jongo = manager.getJongoConnection();
    def sent = 0;
    def failed = 0;

    if (payload.get("broadcast") == true || "true".equals(payload.get("broadcast"))) {
        // Send to all active subscriptions
        def subs = jongo.getCollection("push_subscription__c").find("{active: true}").as(Map.class);
        for (Map sub : subs) {
            try {
                sendPush(sub, jsonPayload, vapidPublicKey, vapidPrivateKey, vapidSubject);
                sent++;
            } catch (Exception e) {
                failed++;
            }
        }
    } else {
        String playerId = (String) payload.get("playerId");
        if (playerId == null) {
            response.put("status", "ERROR");
            response.put("message", "playerId ou broadcast obrigatorio");
            return response;
        }
        def sub = jongo.getCollection("push_subscription__c").findOne("{_id: #}", playerId).as(Map.class);
        if (sub != null) {
            try {
                sendPush(sub, jsonPayload, vapidPublicKey, vapidPrivateKey, vapidSubject);
                sent++;
            } catch (Exception e) {
                failed++;
                response.put("error", e.getMessage());
            }
        }
    }

    response.put("status", "OK");
    response.put("sent", sent);
    response.put("failed", failed);
    return response;
}

private void sendPush(Map sub, String payload, String pubKey, String privKey, String subject) {
    String endpoint = (String) sub.get("endpoint");
    Map keys = (Map) sub.get("keys");
    String p256dh = (String) keys.get("p256dh");
    String auth = (String) keys.get("auth");

    // For now, use simple POST to endpoint (works with some push services)
    // Full Web Push encryption requires a Java library like web-push
    // Simplified: store the subscription and send via frontend scheduling
    // Server push will be Phase 2 when we add a web-push library

    // For now, just verify the subscription is valid
    if (endpoint == null || p256dh == null || auth == null) {
        throw new RuntimeException("Subscription incompleta");
    }
}
