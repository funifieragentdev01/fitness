# Studio Custom Pages — Cupons & Afiliados

## Como Instalar

Usar a API REST para criar as páginas no Studio:

```bash
# Definir token Bearer do Studio
TOKEN="Bearer SEU_TOKEN_AQUI"
API="https://service2.funifier.com"

# Criar cada página via PUT
curl -X PUT "$API/v3/database/studio_page" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ JSON_DA_PAGINA }'
```

Ou colar manualmente em Studio → Marketplace → Pages.

---

## Página 1: Lista de Cupons

```json
{
  "_id": "coupon_list",
  "display": true,
  "title": "🎟️ Cupons de Desconto",
  "slug": "studio/custom/coupon/list",
  "html": "<div class=\"container-fluid\" style=\"padding:20px;\"><h3>🎟️ Cupons de Desconto</h3><br><button class=\"btn btn-success\" ng-click=\"newCoupon()\"><span class=\"glyphicon glyphicon-plus\"></span> Novo Cupom</button> <button class=\"btn btn-default\" ng-click=\"list()\"><span class=\"glyphicon glyphicon-refresh\"></span></button><br><br><table class=\"table table-striped table-bordered\"><thead><tr><th>Código</th><th>Descrição</th><th>Desconto</th><th>Duração</th><th>Usos</th><th>Status</th><th>Ações</th></tr></thead><tbody><tr ng-repeat=\"c in coupons\"><td><strong>{{c._id}}</strong></td><td>{{c.description}}</td><td>{{c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : 'R$ ' + c.discountValue}}</td><td><span class=\"label\" ng-class=\"{'label-info': c.discount_duration !== 'FIRST_ONLY', 'label-warning': c.discount_duration === 'FIRST_ONLY'}\">{{c.discount_duration === 'FIRST_ONLY' ? 'Apenas 1ª parcela' : 'Recorrente'}}</span></td><td>{{c.usedCount || 0}} / {{c.maxUses || '∞'}}</td><td><span class=\"label\" ng-class=\"{'label-success': c.active, 'label-danger': !c.active}\">{{c.active ? 'Ativo' : 'Inativo'}}</span></td><td><button class=\"btn btn-xs btn-primary\" ng-click=\"edit(c)\"><span class=\"glyphicon glyphicon-pencil\"></span></button> <button class=\"btn btn-xs btn-danger\" ng-click=\"remove(c)\"><span class=\"glyphicon glyphicon-trash\"></span></button></td></tr></tbody></table><div ng-if=\"coupons.length === 0\" class=\"alert alert-info\">Nenhum cupom cadastrado.</div></div>",
  "script": "var API = Marketplace.auth.getService(); var headers = { 'Authorization': Marketplace.auth.getAuthorization(), 'content-type': 'application/json' }; $scope.coupons = []; $scope.list = function() { $http({ method: 'GET', url: API + '/v3/database/coupon__c?strict=true', headers: headers }).then(function(r) { $scope.coupons = r.data || []; }); }; $scope.newCoupon = function() { $location.path('/studio/custom/coupon/form/new'); }; $scope.edit = function(c) { $location.path('/studio/custom/coupon/form/' + c._id); }; $scope.remove = function(c) { if (!confirm('Excluir cupom ' + c._id + '?')) return; $http({ method: 'DELETE', url: API + \"/v3/database/coupon__c?q=_id:'\" + c._id + \"'\", headers: headers }).then(function() { $scope.list(); }); }; $scope.list();"
}
```

---

## Página 2: Formulário de Cupom

```json
{
  "_id": "coupon_form",
  "display": false,
  "title": "Formulário de Cupom",
  "slug": "studio/custom/coupon/form/:id",
  "html": "<div class=\"container-fluid\" style=\"padding:20px;max-width:700px;\"><h3>{{isNew ? '➕ Novo Cupom' : '✏️ Editar Cupom'}}</h3><br><form><div class=\"form-group\"><label>Código do Cupom (ID)</label><input class=\"form-control\" ng-model=\"item._id\" ng-disabled=\"!isNew\" placeholder=\"Ex: FITEVOLVE20\" style=\"text-transform:uppercase;\"></div><div class=\"form-group\"><label>Descrição</label><input class=\"form-control\" ng-model=\"item.description\" placeholder=\"Ex: 20% de desconto\"></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label>Tipo de Desconto</label><select class=\"form-control\" ng-model=\"item.discountType\"><option value=\"PERCENTAGE\">Percentual (%)</option><option value=\"FIXED\">Valor Fixo (R$)</option></select></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label>Valor do Desconto</label><input type=\"number\" class=\"form-control\" ng-model=\"item.discountValue\" placeholder=\"Ex: 20\"></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label>Duração do Desconto</label><select class=\"form-control\" ng-model=\"item.discount_duration\"><option value=\"RECURRING\">Recorrente (todas as parcelas)</option><option value=\"FIRST_ONLY\">Apenas 1ª parcela</option></select><p class=\"help-block\" ng-if=\"item.discount_duration === 'FIRST_ONLY'\">O desconto será aplicado apenas no primeiro pagamento. A partir do 2º mês, o valor volta ao normal.</p><p class=\"help-block\" ng-if=\"item.discount_duration !== 'FIRST_ONLY'\">O desconto será aplicado em todas as parcelas enquanto durar a assinatura.</p></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label>Máximo de Usos (0 = ilimitado)</label><input type=\"number\" class=\"form-control\" ng-model=\"item.maxUses\" placeholder=\"0\"></div></div></div><div class=\"form-group\"><label><input type=\"checkbox\" ng-model=\"item.active\"> Ativo</label></div><hr><button class=\"btn btn-primary\" ng-click=\"save()\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> Salvar</button> <button class=\"btn btn-default\" ng-click=\"back()\">Voltar</button><div class=\"alert alert-success\" ng-if=\"saved\" style=\"margin-top:10px;\">✅ Cupom salvo com sucesso!</div><div class=\"alert alert-danger\" ng-if=\"error\" style=\"margin-top:10px;\">{{error}}</div></form></div>",
  "script": "var API = Marketplace.auth.getService(); var headers = { 'Authorization': Marketplace.auth.getAuthorization(), 'content-type': 'application/json' }; $scope.isNew = $routeParams.id === 'new'; $scope.saved = false; $scope.error = ''; $scope.item = { _id: '', description: '', discountType: 'PERCENTAGE', discountValue: 20, discount_duration: 'RECURRING', maxUses: 0, usedCount: 0, active: true }; if (!$scope.isNew) { $http({ method: 'GET', url: API + \"/v3/database/coupon__c?strict=true&q=_id:'\" + $routeParams.id + \"'\", headers: headers }).then(function(r) { if (r.data && r.data.length > 0) { $scope.item = r.data[0]; if (!$scope.item.discount_duration) $scope.item.discount_duration = 'RECURRING'; } }); } $scope.save = function() { $scope.saved = false; $scope.error = ''; if (!$scope.item._id) { $scope.error = 'Código é obrigatório'; return; } $scope.item._id = $scope.item._id.toUpperCase(); $http({ method: 'PUT', url: API + '/v3/database/coupon__c', headers: headers, data: $scope.item }).then(function() { $scope.saved = true; $scope.isNew = false; }).catch(function(e) { $scope.error = 'Erro ao salvar: ' + (e.data && e.data.message || 'desconhecido'); }); }; $scope.back = function() { $location.path('/studio/custom/coupon/list'); };"
}
```

---

## Página 3: Lista de Afiliados

```json
{
  "_id": "affiliate_list",
  "display": true,
  "title": "🤝 Afiliados",
  "slug": "studio/custom/affiliate/list",
  "html": "<div class=\"container-fluid\" style=\"padding:20px;\"><h3>🤝 Programa de Afiliados</h3><br><button class=\"btn btn-success\" ng-click=\"newItem()\"><span class=\"glyphicon glyphicon-plus\"></span> Novo Afiliado</button> <button class=\"btn btn-default\" ng-click=\"list()\"><span class=\"glyphicon glyphicon-refresh\"></span></button><br><br><table class=\"table table-striped table-bordered\"><thead><tr><th>Cupom</th><th>Nome</th><th>Instagram</th><th>Desconto</th><th>Duração Desc.</th><th>Comissão</th><th>Vendas</th><th>Receita</th><th>Status</th><th>Ações</th></tr></thead><tbody><tr ng-repeat=\"a in affiliates\"><td><strong>{{a._id}}</strong></td><td>{{a.name}}</td><td>{{a.instagram}}</td><td>{{a.discount_pct}}%</td><td><span class=\"label\" ng-class=\"{'label-info': a.discount_duration !== 'FIRST_ONLY', 'label-warning': a.discount_duration === 'FIRST_ONLY'}\">{{a.discount_duration === 'FIRST_ONLY' ? '1ª parcela' : 'Recorrente'}}</span></td><td>{{a.commission_pct}}%</td><td>{{a.total_sales || 0}}</td><td>R$ {{(a.total_revenue || 0).toFixed(2)}}</td><td><span class=\"label\" ng-class=\"{'label-success': a.active, 'label-danger': !a.active}\">{{a.active ? 'Ativo' : 'Inativo'}}</span></td><td><button class=\"btn btn-xs btn-primary\" ng-click=\"edit(a)\"><span class=\"glyphicon glyphicon-pencil\"></span></button> <button class=\"btn btn-xs btn-danger\" ng-click=\"remove(a)\"><span class=\"glyphicon glyphicon-trash\"></span></button></td></tr></tbody></table><div ng-if=\"affiliates.length === 0\" class=\"alert alert-info\">Nenhum afiliado cadastrado.</div></div>",
  "script": "var API = Marketplace.auth.getService(); var headers = { 'Authorization': Marketplace.auth.getAuthorization(), 'content-type': 'application/json' }; $scope.affiliates = []; $scope.list = function() { $http({ method: 'GET', url: API + '/v3/database/affiliate__c?strict=true', headers: headers }).then(function(r) { $scope.affiliates = r.data || []; }); }; $scope.newItem = function() { $location.path('/studio/custom/affiliate/form/new'); }; $scope.edit = function(a) { $location.path('/studio/custom/affiliate/form/' + a._id); }; $scope.remove = function(a) { if (!confirm('Excluir afiliado ' + a._id + '?')) return; $http({ method: 'DELETE', url: API + \"/v3/database/affiliate__c?q=_id:'\" + a._id + \"'\", headers: headers }).then(function() { $scope.list(); }); }; $scope.list();"
}
```

---

## Página 4: Formulário de Afiliado

```json
{
  "_id": "affiliate_form",
  "display": false,
  "title": "Formulário de Afiliado",
  "slug": "studio/custom/affiliate/form/:id",
  "html": "<div class=\"container-fluid\" style=\"padding:20px;max-width:700px;\"><h3>{{isNew ? '➕ Novo Afiliado' : '✏️ Editar Afiliado'}}</h3><br><form><div class=\"form-group\"><label>Código do Cupom (ID)</label><input class=\"form-control\" ng-model=\"item._id\" ng-disabled=\"!isNew\" placeholder=\"Ex: MARIA20\" style=\"text-transform:uppercase;\"><p class=\"help-block\">Este será o código que o influenciador divulga.</p></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label>Nome</label><input class=\"form-control\" ng-model=\"item.name\" placeholder=\"Nome completo\"></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label>Email</label><input type=\"email\" class=\"form-control\" ng-model=\"item.email\" placeholder=\"email@exemplo.com\"></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><label>Instagram</label><input class=\"form-control\" ng-model=\"item.instagram\" placeholder=\"@handle\"></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label>Telefone</label><input class=\"form-control\" ng-model=\"item.phone\" placeholder=\"(11) 99999-9999\"></div></div></div><div class=\"form-group\"><label>Data de Nascimento</label><input type=\"date\" class=\"form-control\" ng-model=\"item.birth_date\"></div><hr><h4>💰 Configuração Financeira</h4><div class=\"row\"><div class=\"col-sm-4\"><div class=\"form-group\"><label>Desconto para cliente (%)</label><input type=\"number\" class=\"form-control\" ng-model=\"item.discount_pct\" placeholder=\"20\"></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><label>Comissão do afiliado (%)</label><input type=\"number\" class=\"form-control\" ng-model=\"item.commission_pct\" placeholder=\"15\"><p class=\"help-block\">A comissão é sempre recorrente (split Asaas) enquanto o cliente pagar.</p></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><label>Duração do Desconto</label><select class=\"form-control\" ng-model=\"item.discount_duration\"><option value=\"RECURRING\">Recorrente</option><option value=\"FIRST_ONLY\">Apenas 1ª parcela</option></select></div></div></div><div class=\"alert alert-info\" ng-if=\"item.discount_duration === 'FIRST_ONLY'\"><strong>ℹ️ Apenas 1ª parcela:</strong> O cliente recebe desconto só no primeiro pagamento. A partir do 2º mês cobra valor cheio. A comissão do afiliado continua sendo paga em todas as parcelas via split.</div><div class=\"form-group\"><label>Wallet ID Asaas</label><input class=\"form-control\" ng-model=\"item.asaas_wallet_id\" placeholder=\"ID da carteira Asaas do influenciador\"><p class=\"help-block\">Preenchido automaticamente se usar o trigger de criação de subconta.</p></div><div class=\"form-group\"><label><input type=\"checkbox\" ng-model=\"item.active\"> Ativo</label></div><hr><div ng-if=\"!isNew\"><h4>📊 Estatísticas</h4><div class=\"row\"><div class=\"col-sm-4\"><div class=\"well text-center\"><h4>{{item.total_sales || 0}}</h4><p>Vendas</p></div></div><div class=\"col-sm-4\"><div class=\"well text-center\"><h4>R$ {{(item.total_revenue || 0).toFixed(2)}}</h4><p>Receita gerada</p></div></div><div class=\"col-sm-4\"><div class=\"well text-center\"><h4>R$ {{((item.total_revenue || 0) * (item.commission_pct || 0) / 100).toFixed(2)}}</h4><p>Comissão total</p></div></div></div><hr></div><button class=\"btn btn-primary\" ng-click=\"save()\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> Salvar</button> <button class=\"btn btn-default\" ng-click=\"back()\">Voltar</button><div class=\"alert alert-success\" ng-if=\"saved\" style=\"margin-top:10px;\">✅ Afiliado salvo com sucesso!</div><div class=\"alert alert-danger\" ng-if=\"error\" style=\"margin-top:10px;\">{{error}}</div></form></div>",
  "script": "var API = Marketplace.auth.getService(); var headers = { 'Authorization': Marketplace.auth.getAuthorization(), 'content-type': 'application/json' }; $scope.isNew = $routeParams.id === 'new'; $scope.saved = false; $scope.error = ''; $scope.item = { _id: '', name: '', email: '', instagram: '', phone: '', birth_date: null, asaas_wallet_id: '', discount_pct: 20, commission_pct: 15, discount_duration: 'RECURRING', active: true, total_sales: 0, total_revenue: 0 }; if (!$scope.isNew) { $http({ method: 'GET', url: API + \"/v3/database/affiliate__c?strict=true&q=_id:'\" + $routeParams.id + \"'\", headers: headers }).then(function(r) { if (r.data && r.data.length > 0) { $scope.item = r.data[0]; if (!$scope.item.discount_duration) $scope.item.discount_duration = 'RECURRING'; } }); } $scope.save = function() { $scope.saved = false; $scope.error = ''; if (!$scope.item._id) { $scope.error = 'Código é obrigatório'; return; } $scope.item._id = $scope.item._id.toUpperCase(); if (!$scope.item.created) $scope.item.created = { '$date': new Date().toISOString() }; $http({ method: 'PUT', url: API + '/v3/database/affiliate__c', headers: headers, data: $scope.item }).then(function() { $scope.saved = true; $scope.isNew = false; }).catch(function(e) { $scope.error = 'Erro ao salvar: ' + (e.data && e.data.message || 'desconhecido'); }); }; $scope.back = function() { $location.path('/studio/custom/affiliate/list'); };"
}
```

---

## Instruções para Ricardo

### No Studio (Endpoints):
1. Abrir `validate_coupon` → substituir script pelo novo (ver `discount-duration-feature.md`)
2. Abrir `create_subscription` → substituir script pelo novo (ver `discount-duration-feature.md`)

### No Studio (Páginas Customizadas):
As 4 páginas acima devem ser criadas via:
- Studio → Marketplace → Pages → Criar cada uma
- Ou via API PUT em `/v3/database/studio_page`

### Cupons Existentes:
Cupons sem o campo `discount_duration` são tratados como `"RECURRING"` (compatível com comportamento atual).

### Frontend:
Deploy automático via Netlify (plans.html, plans.js, style.css atualizados).
