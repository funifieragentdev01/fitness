// Trigger: after_create on player
// Purpose: Create Person + Deal in CRM gamification when new user signs up in Orvya
// CRM gamification API key: 69a7317a607db81962b4bf41
// Basic token: NjlhNzMxN2E2MDdkYjgxOTYyYjRiZjQxOjY5YThkNGQwNjA3ZGI4MTk2MmI1ZWU2OA==

void trigger(event, entity, player, database) {
    try {
        String crmBase = "https://service2.funifier.com/v3/database";
        String crmAuth = "Basic NjlhNzMxN2E2MDdkYjgxOTYyYjRiZjQxOjY5YThkNGQwNjA3ZGI4MTk2MmI1ZWU2OA==";

        // Build person ID from player ID
        String personId = entity.id;
        String personName = entity.name != null ? entity.name : personId;
        String personEmail = entity.email != null ? entity.email : "";

        // 1. Create Person in CRM
        HashMap personData = new HashMap();
        personData.put("_id", personId);
        personData.put("name", personName);
        personData.put("email", personEmail);
        personData.put("source", "orvya-app");

        HttpResponse<String> personResp = Unirest.post(crmBase + "/person")
            .header("Content-Type", "application/json")
            .header("Authorization", crmAuth)
            .body(JsonUtil.toJson(personData))
            .asString();

        // 2. Create Deal in CRM pipeline Orvya, stage Interesse
        String pipelineId = "69a74f9a607db81962b4d0e6";
        String stageInteresse = "69a74f9a607db81962b4d0e7";

        HashMap dealData = new HashMap();
        dealData.put("title", personName + " - Orvya Trial");
        dealData.put("person", personId);
        dealData.put("pipeline", pipelineId);
        dealData.put("stage", stageInteresse);
        dealData.put("value", 0);
        dealData.put("currency", "BRL");
        dealData.put("status", "open");
        dealData.put("owner", "funifier.agent.dev01@gmail.com");
        dealData.put("visible_to", "all");

        // add_time as epoch millis
        dealData.put("add_time", new Date().getTime());

        HttpResponse<String> dealResp = Unirest.post(crmBase + "/deal")
            .header("Content-Type", "application/json")
            .header("Authorization", crmAuth)
            .body(JsonUtil.toJson(dealData))
            .asString();

    } catch (Exception e) {
        // Silent fail - CRM integration should not block signup
    }
}
