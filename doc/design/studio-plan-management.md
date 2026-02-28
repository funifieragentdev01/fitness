# Studio Custom Page — Plan Management

## Como criar no Funifier Studio

1. Acesse **Studio > Marketplace > Pages**
2. Crie uma nova página customizada
3. Cole o HTML abaixo no editor

## Código da Página

```html
<!DOCTYPE html>
<html ng-app="planAdmin">
<head>
    <meta charset="UTF-8">
    <title>Gerenciamento de Planos</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.2/angular.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th { background: #1A2744; color: #fff; padding: 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .badge-standard { background: #e0e0e0; color: #333; }
        .badge-premium { background: linear-gradient(135deg, #FFD700, #FF6B00); color: #000; }
        .btn { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .btn-upgrade { background: #FFD700; color: #000; }
        .btn-downgrade { background: #e0e0e0; color: #333; }
        .btn-reset { background: #2196F3; color: #fff; }
        .stats { display: flex; gap: 16px; margin-bottom: 20px; }
        .stat-card { background: #fff; padding: 16px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat-card h3 { margin: 0; font-size: 28px; }
        .stat-card p { margin: 4px 0 0; color: #666; font-size: 13px; }
    </style>
</head>
<body ng-controller="PlanCtrl">
    <div class="container">
        <h1>👑 Gerenciamento de Planos</h1>

        <div class="stats">
            <div class="stat-card">
                <h3>{{players.length}}</h3>
                <p>Total de jogadores</p>
            </div>
            <div class="stat-card">
                <h3>{{premiumCount}}</h3>
                <p>Premium</p>
            </div>
            <div class="stat-card">
                <h3>{{players.length - premiumCount}}</h3>
                <p>Standard</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Jogador</th>
                    <th>Email</th>
                    <th>Plano</th>
                    <th>Alterações Usadas</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr ng-repeat="p in players">
                    <td>{{p.name || p._id}}</td>
                    <td>{{p.email}}</td>
                    <td>
                        <span class="badge" ng-class="{'badge-premium': p.extra.plan.type === 'premium', 'badge-standard': p.extra.plan.type !== 'premium'}">
                            {{p.extra.plan.type === 'premium' ? '👑 Premium' : '⭐ Standard'}}
                        </span>
                    </td>
                    <td>
                        🍽 {{p.extra.plan.changesUsed.mealPlan || 0}} |
                        🏋️ {{p.extra.plan.changesUsed.workoutPlan || 0}} |
                        📷 {{p.extra.plan.changesUsed.bodyCheckin || 0}} |
                        📋 {{p.extra.plan.changesUsed.bioReport || 0}}
                    </td>
                    <td>
                        <button class="btn btn-upgrade" ng-if="p.extra.plan.type !== 'premium'" ng-click="changePlan(p, 'premium')">Upgrade</button>
                        <button class="btn btn-downgrade" ng-if="p.extra.plan.type === 'premium'" ng-click="changePlan(p, 'standard')">Downgrade</button>
                        <button class="btn btn-reset" ng-click="resetChanges(p)">Reset</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <script>
        angular.module('planAdmin', []).controller('PlanCtrl', function($scope, $http) {
            var auth = Marketplace.auth;
            var apiUrl = auth.getService();
            var headers = { 'Authorization': 'Bearer ' + auth.getToken() };

            $scope.players = [];
            $scope.premiumCount = 0;

            function loadPlayers() {
                $http.post(apiUrl + '/v3/database/player/aggregate?strict=true', [
                    { "$match": { "extra.plan": { "$exists": true } } },
                    { "$project": { "_id": 1, "name": 1, "email": 1, "extra.plan": 1 } }
                ], { headers: headers }).then(function(res) {
                    $scope.players = res.data || [];
                    $scope.premiumCount = $scope.players.filter(function(p) {
                        return p.extra && p.extra.plan && p.extra.plan.type === 'premium';
                    }).length;
                });
            }

            $scope.changePlan = function(player, newType) {
                var plan = player.extra.plan;
                plan.type = newType;
                $http.post(apiUrl + '/v3/player', {
                    _id: player._id,
                    extra: { plan: plan }
                }, { headers: headers }).then(function() {
                    loadPlayers();
                });
            };

            $scope.resetChanges = function(player) {
                var plan = player.extra.plan;
                plan.changesUsed = { mealPlan: 0, workoutPlan: 0, goal: 0, bodyCheckin: 0, bioReport: 0, lastReset: new Date().toISOString().slice(0, 10) };
                $http.post(apiUrl + '/v3/player', {
                    _id: player._id,
                    extra: { plan: plan }
                }, { headers: headers }).then(function() {
                    loadPlayers();
                });
            };

            loadPlayers();
        });
    </script>
</body>
</html>
```

## Funcionalidades

- **Lista todos os jogadores** com plano configurado
- **Dashboard** com contagem de Standard vs Premium
- **Upgrade/Downgrade** — altera o tipo de plano do jogador
- **Reset de limites** — zera as alterações usadas no mês
- Usa `Marketplace.auth` para autenticação automática no Studio
