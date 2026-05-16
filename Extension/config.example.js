// config.example.js
// Copy this file to config.local.js and add your actual API keys
// config.local.js is in .gitignore and will NOT be committed

const CONFIG = {
    // Google Custom Search API
    GOOGLE_API_KEY: 'your-google-api-key-here',
    GOOGLE_SEARCH_ENGINE_ID: 'your-search-engine-cx-id',

    // Google Gemini API for AI categorization
    GEMINI_API_KEY: 'your-gemini-api-key-here',

    // Backend API endpoints
    API_BASE_URL: 'http://localhost:5000',

    // Feature flags
    USE_BACKEND_FOR_SEARCH: false, // Set to true to use backend instead of direct API calls
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
