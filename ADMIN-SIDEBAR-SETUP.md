# Shopify Admin Sidebar Integration Setup

This guide will help you set up the Product Configurator to appear in your Shopify admin sidebar instead of as frontend pages.

## 🚀 Quick Overview

The admin functionality will be accessible through:
- **Main Admin Dashboard**: Accessible via Shopify admin sidebar
- **Product Setup Wizard**: Integrated admin interface
- **Design Review Queue**: Built-in approval system
- **Side Configurations**: Product customization settings

## 📋 Prerequisites

1. **Shopify CLI** installed globally:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Shopify Partner Account** with app development access

3. **Development Store** for testing

## 🛠️ Setup Instructions

### Step 1: Install Dependencies

```bash
cd shopify-product-configurator-app
npm install
```

### Step 2: Configure Environment Variables

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values:
   ```env
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SCOPES=write_products,read_products,write_orders,read_orders,write_files,read_files
   HOST=https://your-app-url.com
   APPLICATION_URL=https://your-app-url.com
   DEV_STORE_URL=your-dev-store.myshopify.com
   PORT=3000
   ```

### Step 3: Create Shopify App (if not exists)

1. **Using Shopify CLI:**
   ```bash
   shopify app create
   ```

2. **Or manually in Partner Dashboard:**
   - Go to [Shopify Partners](https://partners.shopify.com)
   - Create new app
   - Get API key and secret

### Step 4: Deploy the App

#### Option A: Development Mode
```bash
npm run shopify:dev
```

#### Option B: Production Deployment
```bash
npm run shopify:deploy
```

#### Option C: Manual Deployment (Vercel/Heroku)
```bash
# Deploy your server.js to your preferred platform
npm start
```

### Step 5: Install App in Your Store

1. **Via Shopify CLI:**
   ```bash
   shopify app install
   ```

2. **Or manually:**
   - Go to your development store admin
   - Navigate to Apps
   - Install your app

## 🎯 Admin Access Points

Once installed, you'll find the Product Configurator in your Shopify admin:

### 📍 Sidebar Navigation
- **Location**: Apps section in Shopify admin sidebar
- **Name**: "Product Configurator"
- **URL**: `/admin/apps/your-app-handle/configurator`

### 🔧 Admin Features Available

1. **Dashboard Overview**
   - Pending designs count
   - Configured products count
   - Recent orders summary

2. **Product Setup Wizard**
   - Step-by-step product configuration
   - Print area setup
   - Pricing configuration

3. **Design Review Queue**
   - Approve/reject customer designs
   - Design preview and details
   - Bulk actions

4. **Side Configurations**
   - Product side setup
   - Color and decoration methods
   - Upload settings

5. **Order Management**
   - Orders with custom designs
   - Design tracking
   - Status updates

## 🔗 URL Structure

The admin interface will be accessible at:
- **Main Dashboard**: `https://admin.shopify.com/store/your-store/apps/product-configurator/configurator`
- **Setup Wizard**: `https://admin.shopify.com/store/your-store/apps/product-configurator/setup-wizard`
- **Design Review**: `https://admin.shopify.com/store/your-store/apps/product-configurator/design-review`

## 🛡️ Security & Permissions

The app requires these Shopify permissions:
- `write_products` - Create and modify product configurations
- `read_products` - Access product data
- `write_orders` - Update order information
- `read_orders` - Access order data
- `write_files` - Upload design files
- `read_files` - Access uploaded files

## 🔧 Troubleshooting

### Common Issues:

1. **App not appearing in sidebar:**
   - Check if app is properly installed
   - Verify extension configuration in `shopify.extension.toml`
   - Ensure app has correct permissions

2. **Authentication errors:**
   - Verify API key and secret in `.env`
   - Check app URL configuration
   - Ensure redirect URLs are correct

3. **Extension not loading:**
   - Run `shopify app deploy` to update extensions
   - Check browser console for errors
   - Verify server is running and accessible

### Debug Commands:

```bash
# Check app status
shopify app info

# View app logs
shopify app logs

# Redeploy extensions
shopify app deploy
```

## 📱 Mobile Admin Support

The admin interface is responsive and works on:
- Desktop browsers
- Shopify Mobile app (limited functionality)
- Tablet devices

## 🔄 Updates and Maintenance

To update the admin interface:

1. **Update code**
2. **Redeploy app:**
   ```bash
   npm run shopify:deploy
   ```
3. **Update extensions if needed:**
   ```bash
   shopify app generate extension
   ```

## 📞 Support

For issues with the admin sidebar integration:
1. Check the troubleshooting section above
2. Review Shopify CLI documentation
3. Check app logs for specific errors
4. Verify all configuration files are correct

---

**Note**: This setup replaces the frontend page-based admin interface with a proper Shopify admin integration. The original theme sections can still be used as fallbacks if needed.