public Object handle(Object payload) {
    def d = String.valueOf((char)0x24)
    def ASAAS_KEY = d + 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0'
    def ASAAS_URL = 'https://api-sandbox.asaas.com/v3'
    def slurper = new groovy.json.JsonSlurper()

    def player = manager.getPlayerManager().findById('test_payment_e2e')
    if (player.extra == null) player.extra = new java.util.HashMap()
    
    def rawSubId = player.extra.get('asaas_subscription_id')
    String subscriptionId = rawSubId != null ? rawSubId.toString() : null
    
    String url = ASAAS_URL + '/subscriptions/' + subscriptionId
    def resp = Unirest.get(url).header('access_token', ASAAS_KEY).asString()
    
    Map result = new java.util.HashMap()
    result.put('subscriptionId', subscriptionId)
    result.put('url', url)
    result.put('status', resp.getStatus())
    result.put('bodyClass', resp.getBody().getClass().getName())
    return result
}
