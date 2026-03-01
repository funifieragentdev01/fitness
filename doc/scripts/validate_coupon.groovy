public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();

    String code = (String) payload.get("couponCode");
    if (code == null || code.trim().isEmpty()) {
        response.put("valid", false);
        response.put("error", "Codigo do cupom e obrigatorio");
        return response;
    }

    code = code.trim().toUpperCase();
    Object coupon = manager.getJongoConnection().getCollection("coupon__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);

    if (coupon == null) {
        response.put("valid", false);
        response.put("error", "Cupom invalido");
        return response;
    }

    // Check max uses
    int maxUses = coupon.get("maxUses") != null ? ((Number) coupon.get("maxUses")).intValue() : 0;
    int currentUses = coupon.get("currentUses") != null ? ((Number) coupon.get("currentUses")).intValue() : 0;
    if (maxUses > 0 && currentUses >= maxUses) {
        response.put("valid", false);
        response.put("error", "Cupom esgotado");
        return response;
    }

    response.put("valid", true);
    response.put("discountType", coupon.get("discountType"));
    response.put("discountValue", coupon.get("discountValue"));
    response.put("description", coupon.get("description"));
    return response;
}