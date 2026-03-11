// Orvya Configuration - COPY TO config.js AND FILL IN YOUR KEYS
var CONFIG = {
    API: 'https://service2.funifier.com',
    API_KEY: 'YOUR_FUNIFIER_API_KEY',
    BASIC_TOKEN: 'Basic ' + btoa('YOUR_FUNIFIER_API_KEY:'),
    // OPENAI_KEY removed — all AI calls go through Funifier proxy endpoints
    // (ai_chat, ai_vision, coach_ephemeral) which keep the API key server-side
    APP_NAME: 'Orvya',
    APP_TAGLINE: 'Evolua no seu ritmo.',
    VERSION: '0.1.0',
    // Google OAuth
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    // Web Push VAPID
    VAPID_PUBLIC_KEY: 'YOUR_VAPID_PUBLIC_KEY',
    // Asaas Payment Gateway
    ASAAS_ENV: 'sandbox' // 'sandbox' or 'production'
};
