# Trigger: Player Cleanup on Delete

## Purpose
When a player is deleted via `DELETE /v3/player/{userId}`, clean up all custom collection documents for that user.

## Collections to clean
- `profile__c` — user profile
- `body_checkin__c` — body check-in history
- `checkin__c` — daily check-ins (meal/water/workout)
- `testimonial__c` — user testimonials
- `signup__c` — signup data

## Setup in Funifier Studio

1. Go to **Studio > Triggers**
2. Create a new trigger:
   - **Entity:** `player`
   - **Event:** `before_delete` (or `after_delete`)
   - **Script:**

```javascript
// Trigger: Clean up custom collections when player is deleted
var userId = entity._id || entity.userId;

var collections = ['profile__c', 'body_checkin__c', 'checkin__c', 'testimonial__c', 'signup__c'];

collections.forEach(function(col) {
    // For profile__c and signup__c, _id = userId
    db.getCollection(col).remove({ userId: userId });
    // Also try _id match (profile__c uses _id = userId)
    db.getCollection(col).remove({ _id: userId });
});

// checkin__c uses _id pattern: userId_type_YYYY-MM-DD
db.getCollection('checkin__c').remove({ _id: { $regex: '^' + userId + '_' } });
```

## Alternative: Client-side cleanup

If triggers are not available, the app can call cleanup before deleting the player. Add to `AuthService.deleteAccount()`:

```javascript
// Before calling DELETE /v3/player/{userId}
ApiService.deleteCheckinsByUser(userId).then(function(res) {
    // Delete each doc individually
    (res.data || []).forEach(function(doc) {
        $http.delete(API + '/v3/database/checkin__c/' + doc._id, authHeader());
    });
});
```

## Notes
- The server-side trigger is preferred (atomic, no race conditions)
- Client-side cleanup is a fallback if Studio triggers aren't configured
