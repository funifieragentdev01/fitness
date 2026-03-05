public Object handle(Object payload) {
    Map response = new HashMap();

    String playerId = (String) payload.get("playerId");
    Map subscription = (Map) payload.get("subscription");

    if (playerId == null || subscription == null) {
        response.put("status", "ERROR");
        response.put("message", "playerId e subscription obrigatorios");
        return response;
    }

    String endpoint = (String) subscription.get("endpoint");
    Map keys = (Map) subscription.get("keys");

    if (endpoint == null || keys == null) {
        response.put("status", "ERROR");
        response.put("message", "subscription incompleta");
        return response;
    }

    // Save subscription to push_subscription__c collection
    Map doc = new HashMap();
    doc.put("_id", playerId);
    doc.put("endpoint", endpoint);
    doc.put("keys", keys);
    doc.put("updated", new Date());
    doc.put("active", true);

    manager.getJongoConnection().getCollection("push_subscription__c").save(doc);

    response.put("status", "OK");
    response.put("message", "Subscription salva");
    return response;
}
