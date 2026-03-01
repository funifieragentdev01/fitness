public Object handle(Object payload) {
    def playerId = payload.get('playerId') ?: 'test_payment_e2e'
    def player = manager.getPlayerManager().findById(playerId)
    if (!player) return [error: 'not found']
    
    Map result = new HashMap()
    result.put('extra_class', player.extra.getClass().getName())
    
    player.extra.each { k, v ->
        String valClass = v != null ? v.getClass().getName() : 'null'
        String valStr = v != null ? v.toString() : 'null'
        result.put('extra_' + k + '_class', valClass)
        result.put('extra_' + k + '_value', valStr.length() > 50 ? valStr.substring(0, 50) : valStr)
    }
    
    def plan = player.extra.get('plan')
    if (plan != null) {
        result.put('plan_class', plan.getClass().getName())
        if (plan.getClass().getName().contains('Map')) {
            plan.each { k, v ->
                String valClass = v != null ? v.getClass().getName() : 'null'
                result.put('plan_' + k + '_class', valClass)
            }
        }
    }
    
    return result
}
