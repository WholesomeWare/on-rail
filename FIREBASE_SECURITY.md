# Firebase Configuration Setup

This document explains how the Firebase configuration has been secured and how to set it up for development and production.

## Security Improvements

The Firebase configuration has been moved from hardcoded values in the source code to environment variables for better security:

1. **Environment Variables**: All Firebase config values are now stored in environment variables
2. **Git Ignored**: The `.env` file containing actual values is git-ignored to prevent accidental commits
3. **Template File**: A `.env.example` file provides a template for new developers

## Setup Instructions

### For Development

1. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual Firebase configuration values:
   ```
   PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   # ... etc
   ```

### For Production/Deployment

When deploying to production platforms, set these environment variables in your hosting platform's environment configuration:

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_DATABASE_URL`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_FIREBASE_MEASUREMENT_ID`

## Important Notes

- These are **public** environment variables (prefixed with `PUBLIC_`) because Firebase client configuration is inherently public
- The security comes from preventing accidental exposure in version control, not from hiding the values from end users
- For truly sensitive Firebase operations, use Firebase Admin SDK on the server side with private keys

## Files Modified

- `src/lib/firebase.ts` - Updated to use environment variables
- `src/app.d.ts` - Added TypeScript declarations for environment variables
- `.env` - Created with actual Firebase configuration (git-ignored)
- `.env.example` - Created as a template for other developers
