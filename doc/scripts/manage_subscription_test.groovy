public Object handle(Object payload) {
    def d = String.valueOf((char)0x24)
    def key = d + 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0'
    def resp = Unirest.get('https://api-sandbox.asaas.com/v3/subscriptions?limit=1').header('access_token', key).asString()
    Map result = new HashMap()
    result.put('status', resp.getStatus())
    result.put('bodyClass', resp.getBody().getClass().getName())
    result.put('body', resp.getBody().toString())
    return result
}
