# Shopify Product Configurator

A comprehensive Shopify app for product customization with admin sidebar integration.

## 🚀 Features

- **Admin Sidebar Integration** - Native Shopify admin experience
- **Product Setup Wizard** - Step-by-step product configuration
- **Design Editor** - Customer design creation with Fabric.js
- **Design Review System** - Admin approval workflow
- **Real-time Pricing** - Dynamic pricing based on customization
- **Multi-side Design** - Front and back customization
- **Print Area Constraints** - Accurate design boundaries
- **Color Detection** - Automatic color analysis
- **DPI Validation** - Quality assurance for designs

## 📁 Project Structure

```
├── server.js                    # Express.js backend
├── shopify.app.toml             # Shopify app configuration
├── package.json                 # Dependencies and scripts
├── vercel.json                  # Vercel deployment config
├── extensions/                  # Shopify admin extensions
│   ├── admin-nav/               # Admin sidebar navigation
│   └── admin-dashboard/         # Admin action extensions
├── web/frontend/                # React admin interface
└── views/                       # HTML templates
```

## 🛠️ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Shopify credentials
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Install in Shopify
```bash
shopify app install
```

## 🎯 Admin Access

Access the Product Configurator through:
- **Shopify Admin Sidebar** → Apps → Product Configurator
- **URL**: `https://admin.shopify.com/store/your-store/apps/product-configurator`

## 📋 Admin Features

- **Dashboard** - Overview of designs, products, and orders
- **Product Setup** - Configure customizable products
- **Design Review** - Approve/reject customer designs
- **Side Config** - Set up product sides and decoration methods
- **Order Management** - Track orders with custom designs

## 🔧 Technical Stack

- **Backend**: Node.js, Express.js, Shopify API
- **Frontend**: React, Shopify Polaris, Fabric.js
- **Storage**: Shopify Metafields/Metaobjects
- **File Upload**: Multer
- **Deployment**: Vercel

## 🚀 Deployment

### Environment Variables
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_products,write_orders,read_orders,write_files,read_files
HOST=https://your-vercel-app.vercel.app
APPLICATION_URL=https://your-vercel-app.vercel.app
DEV_STORE_URL=your-dev-store.myshopify.com
PORT=3000
NODE_ENV=production
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 📖 API Endpoints

### Admin Endpoints
- `GET /admin/configurator` - Main admin dashboard
- `GET /admin/setup-wizard` - Product setup wizard
- `GET /admin/design-review` - Design review queue
- `GET /admin/side-config` - Side configurations

### Product Configuration
- `POST /api/admin/products/:id/setup` - Configure product
- `GET /api/admin/products/:id/sides` - Get product sides
- `POST /api/admin/products/:id/sides` - Create product side

### Design Management
- `GET /api/designs/pending` - Get pending designs
- `POST /api/designs/:id/approve` - Approve design
- `POST /api/designs/:id/reject` - Reject design

## 🔐 Security

- Shopify OAuth authentication
- Secure API endpoints
- Environment variable protection
- Input validation and sanitization

## 📞 Support

For setup assistance:
1. Check the documentation files
2. Review environment configuration
3. Verify Shopify app settings

---

**Built for Shopify stores requiring advanced product customization capabilities.**