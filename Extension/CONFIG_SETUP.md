# Extension Configuration Guide

## Setting Up API Keys Securely

To protect your API keys from being exposed on GitHub, follow these steps:

### 1. Create a Local Configuration File

Create a file `Extension/config.local.js` (this file is ignored by git):

```javascript
// config.local.js - DO NOT COMMIT THIS FILE
const CONFIG = {
  GOOGLE_API_KEY: "your-google-api-key-here",
  GOOGLE_SEARCH_ENGINE_ID: "your-search-engine-id",
  GEMINI_API_KEY: "your-gemini-api-key-here",
};
```

### 2. Update Your popup.js

Replace hardcoded keys with this pattern:

```javascript
// Load config from Chrome storage (secure)
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["API_CONFIG"], (result) => {
      resolve(result.API_CONFIG || {});
    });
  });
}

// Use it like this:
const config = await getConfig();
const API_KEY = config.GOOGLE_API_KEY;
```

### 3. Set Keys in Chrome Storage

Add this to your extension's setup/first-run logic:

```javascript
// Initialize extension with API keys
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    API_CONFIG: {
      GOOGLE_API_KEY: "your-key-here",
      GOOGLE_SEARCH_ENGINE_ID: "your-id-here",
      GEMINI_API_KEY: "your-key-here",
    },
  });
});
```

### 4. Alternative: Use Backend API

Better approach - store keys on your backend:

```javascript
// Instead of calling Google APIs directly from the extension,
// call your backend endpoint which securely uses the API keys
async function searchJobs(query) {
  const response = await fetch("http://localhost:5000/api/jobs/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  return response.json();
}
```

## Why This Matters

- **Security**: Never expose API keys in source code
- **Access Control**: Keys in Chrome storage are per-user
- **Revocation**: Easy to rotate keys without code changes
- **Compliance**: Meets security best practices for API management

## For Development

1. Keep your keys in `config.local.js` locally
2. Load them into Chrome storage on extension startup
3. The extension uses them from storage, not from code

## For Production

- Use your backend server to handle all API calls
- Store keys in secure environment variables on your server
- Extension communicates with your backend only
