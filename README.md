# Shopify Custom Product Configurator

A complete solution for creating customizable products on Shopify with advanced design capabilities, real-time pricing, and comprehensive admin management.

## Features

### Customer Features
- **Design Creation**: Upload and edit designs for multiple print areas
- **Product Customization**: Select colors, decoration methods, quantities, and sizes
- **Real-time Pricing**: Dynamic pricing based on decoration method, quantity, colors, and locations
- **Cart Management**: Design-based item grouping and editing
- **Account Portal**: Save and manage designs
- **Design Editor**: Canvas-based design editing with Fabric.js

### Admin Features
- **Design Review**: Approve or reject customer designs
- **Order Management**: View and process orders
- **Product Setup**: Configure customizable products with the setup wizard
- **Template Management**: Create reusable product templates

## Technical Architecture

### Frontend
- Shopify Liquid templates
- JavaScript with Fabric.js for canvas editing
- Responsive design

### Backend
- Node.js with Express.js
- Shopify API integration
- Metaobject storage for designs
- File upload handling with Multer
- Color detection with ColorThief

### Data Storage
- Shopify Metafields for product configuration
- Shopify Metaobjects for design storage
- File system for uploaded images

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd shopify-product-configurator-app
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SCOPES=read_products,write_products,read_metaobjects,write_metaobjects
   HOST=https://your-app-url.vercel.app
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production deployment, use:
   ```bash
   npm start
   ```

## Shopify Theme Integration

Upload the following files to your Shopify theme:

- `sections/design-editor.liquid`
- `sections/account-designs.liquid`
- `sections/admin-dashboard.liquid`
- `sections/product-setup-wizard.liquid`
- `sections/cart.liquid`
- `templates/product.customize.json`
- `templates/page.design-editor.json`
- `templates/page.account-designs.json`
- `templates/page.admin-dashboard.json`
- `templates/page.product-setup-wizard.json`

## API Endpoints

### Public Endpoints
- `GET /` - Health check
- `GET /api/health` - Health check

### Authenticated Endpoints
- `GET /api/products/:id/config` - Get product configuration
- `POST /api/price/calculate` - Calculate pricing
- `GET /api/designs` - List designs
- `GET /api/designs/:id` - Get specific design
- `POST /api/designs` - Create design
- `PUT /api/designs/:id` - Update design

### Admin Endpoints
- `GET /api/admin/designs/pending` - List pending designs
- `PUT /api/admin/designs/:id/approve` - Approve design
- `PUT /api/admin/designs/:id/reject` - Reject design
- `GET /api/admin/orders` - List orders
- `GET /api/admin/products` - List products
- `GET /api/admin/templates` - List templates
- `POST /api/admin/products/:id/setup` - Setup product

## Deployment

This app is ready for deployment to Vercel or other Node.js hosting platforms. Follow the deployment guide in `DEPLOYMENT-GUIDE.md` for detailed instructions.

## Documentation

- `DEPLOYMENT-GUIDE.md` - Complete deployment instructions
- `TESTING-GUIDE.md` - Comprehensive testing procedures
- `IMPLEMENTATION-SUMMARY.md` - Technical implementation overview
- `FINAL-IMPLEMENTATION-SUMMARY.md` - Final project summary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.