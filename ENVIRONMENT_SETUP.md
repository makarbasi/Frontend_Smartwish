# Environment Setup Guide

This guide explains how to set up environment variables for the SmartWish application.

## Development Environment

For local development, create a `.env` file in the `frontend` directory:

```bash
# .env (for development)
VITE_API_URL=http://localhost:3000
```

## Production Environment

For production deployment (e.g., Render.com), set the following environment variable:

```bash
# .env.production (for production)
VITE_API_URL=https://smartwish.onrender.com
```

## Environment Variable Priority

The application uses the following priority order for API URLs:

1. **VITE_API_URL** (if explicitly set)
2. **Development detection** (localhost/127.0.0.1 → http://localhost:3000)
3. **Production detection**:
   - Render.com domains → Same domain
   - SmartWish domains → https://app.smartwish.us
   - Other domains → Same domain

## Render.com Deployment

When deploying to Render.com:

1. Set the environment variable `VITE_API_URL` to your backend URL
2. The frontend and backend should be on the same domain for optimal performance
3. Example: `VITE_API_URL=https://smartwish.onrender.com`

## Verification

To verify your environment is set up correctly:

1. Check the browser console for API configuration logs
2. Look for: `🔧 API Configuration:` followed by the base URL
3. Ensure API calls are going to the correct endpoint

## Troubleshooting

- **API calls failing**: Check that `VITE_API_URL` is set correctly
- **CORS errors**: Ensure backend allows requests from frontend domain
- **404 errors**: Verify backend endpoints are accessible at the configured URL
