# Deployment Guide

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a Shopify Partner account and development store if you haven't already.

3. Create a Shopify App in your Shopify Partner Dashboard.

## Step 1: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Shopify API credentials:
   ```env
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SCOPES=read_products,write_products,read_metaobjects,write_metaobjects
   HOST=https://your-app-name.vercel.app
   ```

## Step 2: Deploy to Vercel

1. Login to your Vercel account:
   ```bash
   vercel login
   ```

2. Deploy the app for the first time:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Select your Vercel account
   - Link to existing project? `N`
   - What's your project's name? `shopify-product-configurator`
   - In which directory is your code located? `./`

3. Set environment variables in Vercel:
   ```bash
   vercel env add SHOPIFY_API_KEY
   vercel env add SHOPIFY_API_SECRET
   vercel env add SCOPES
   vercel env add HOST
   ```

4. Redeploy the app:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Shopify App

1. Go to your Shopify Partner Dashboard
2. Find your app and click "App setup"
3. Update the following settings:
   - App URL: `https://your-app-name.vercel.app`
   - Whitelisted redirection URL(s): `https://your-app-name.vercel.app/api/auth/callback`

## Step 4: Install the App

1. In your Shopify Partner Dashboard, click "Select store" and choose your development store
2. Click "Install app"
3. Confirm the installation

## Troubleshooting

### Environment Variables Not Set

If you get errors about missing environment variables:

1. Check that you've set all required environment variables:
   ```bash
   vercel env list
   ```

2. If any are missing, add them:
   ```bash
   vercel env add VARIABLE_NAME
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

### Authentication Issues

If you encounter authentication issues:

1. Verify that your App URL and Whitelisted redirection URLs are correctly set in the Shopify Partner Dashboard
2. Check that the HOST environment variable matches your Vercel deployment URL
3. Ensure that your API Key and Secret are correct

### Metafields Not Loading

If metafields are not loading in the frontend:

1. Verify that all required metafields are configured on your Shopify products
2. Check the browser console for any JavaScript errors
3. Ensure that the product.liquid file is correctly referencing the metafields

## Updating the Deployment

To update your deployment after making changes:

1. Commit your changes to git
2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Monitoring

You can monitor your app's performance and logs in the Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. View logs, metrics, and performance data