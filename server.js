require('dotenv').config();
const express = require('express');
const { shopifyApp } = require('@shopify/shopify-app-express');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Validate required environment variables
const requiredEnvVars = ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'SCOPES', 'HOST'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize Shopify App
const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES.split(','),
    hostName: process.env.HOST.replace(/https:\/\//, ''),
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  sessionStorage: new MemorySessionStorage(),
});

// Set up Express app
const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Set up authentication routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);

// Simple routes for testing
app.get('/', (req, res) => {
  res.send('Shopify Product Configurator App is running!');
});

// Admin interface routes
app.get('/admin/configurator', shopify.ensureInstalledOnShop(), (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product Configurator Admin</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #e1e3e5; padding-bottom: 20px; margin-bottom: 30px; }
        .tabs { display: flex; border-bottom: 1px solid #e1e3e5; margin-bottom: 20px; }
        .tab { padding: 12px 20px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #008060; color: #008060; }
        .card { background: white; border: 1px solid #e1e3e5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .stat-card { text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; color: #008060; }
        .btn { background: #008060; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #006b4f; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Product Configurator Admin</h1>
          <p>Manage custom product configurations and designs</p>
        </div>
        
        <div class="tabs">
          <div class="tab active" onclick="showTab('dashboard')">Dashboard</div>
          <div class="tab" onclick="showTab('setup')">Product Setup</div>
          <div class="tab" onclick="showTab('designs')">Design Review</div>
          <div class="tab" onclick="showTab('config')">Side Config</div>
          <div class="tab" onclick="showTab('orders')">Orders</div>
        </div>
        
        <div id="dashboard" class="tab-content">
          <div class="stats">
            <div class="card stat-card">
              <div class="stat-number" id="pending-designs">0</div>
              <div>Pending Designs</div>
            </div>
            <div class="card stat-card">
              <div class="stat-number" id="configured-products">0</div>
              <div>Configured Products</div>
            </div>
            <div class="card stat-card">
              <div class="stat-number" id="recent-orders">0</div>
              <div>Recent Orders</div>
            </div>
          </div>
        </div>
        
        <div id="setup" class="tab-content" style="display:none;">
          <div class="card">
            <h2>Product Setup Wizard</h2>
            <p>Configure products with print areas, pricing, and decoration methods.</p>
            <button class="btn" onclick="window.open('/pages/product-setup-wizard', '_blank')">Launch Setup Wizard</button>
          </div>
        </div>
        
        <div id="designs" class="tab-content" style="display:none;">
          <div class="card">
            <h2>Design Review Queue</h2>
            <div id="designs-list">Loading designs...</div>
          </div>
        </div>
        
        <div id="config" class="tab-content" style="display:none;">
          <div class="card">
            <h2>Product Side Configurations</h2>
            <p>Set up colors, decoration methods, and upload settings for each product side.</p>
            <button class="btn" onclick="window.open('/pages/admin-dashboard', '_blank')">Configure Product Sides</button>
          </div>
        </div>
        
        <div id="orders" class="tab-content" style="display:none;">
          <div class="card">
            <h2>Orders with Custom Designs</h2>
            <div id="orders-list">Loading orders...</div>
          </div>
        </div>
      </div>
      
      <script>
        function showTab(tabName) {
          // Hide all tab contents
          document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
          document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
          
          // Show selected tab
          document.getElementById(tabName).style.display = 'block';
          event.target.classList.add('active');
        }
        
        // Load dashboard data
        async function loadDashboardData() {
          try {
            const [designsRes, productsRes, ordersRes] = await Promise.all([
              fetch('/api/admin/designs/pending'),
              fetch('/api/admin/products'),
              fetch('/api/admin/orders')
            ]);
            
            const designs = await designsRes.json();
            const products = await productsRes.json();
            const orders = await ordersRes.json();
            
            document.getElementById('pending-designs').textContent = designs.designs?.length || 0;
            document.getElementById('configured-products').textContent = products.products?.length || 0;
            document.getElementById('recent-orders').textContent = orders.orders?.length || 0;
          } catch (error) {
            console.error('Error loading dashboard data:', error);
          }
        }
        
        // Load data on page load
        loadDashboardData();
      </script>
    </body>
    </html>
  `);
});

app.get('/admin/setup-wizard', shopify.ensureInstalledOnShop(), (req, res) => {
  res.redirect('/pages/product-setup-wizard');
});

app.get('/admin/design-review', shopify.ensureInstalledOnShop(), (req, res) => {
  res.redirect('/pages/admin-dashboard');
});

app.get('/admin/side-config', shopify.ensureInstalledOnShop(), (req, res) => {
  res.redirect('/pages/admin-dashboard');
});

// API routes for product configurator
app.get('/api/products/:id/config', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate required parameters
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Use Shopify Admin API to retrieve product metafields
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    const productMetafields = await client.get({
      path: `products/${productId}/metafields`,
    });
    
    // Process metafields to create configuration
    const config = {
      decorationMethods: {},
      pricingTiers: {}
    };
    
    // Extract relevant metafields
    productMetafields.body.metafields.forEach(metafield => {
      // Process metafields based on namespace and key
      // This is a simplified example - in a real implementation, you would
      // have a more comprehensive mapping based on your metafield structure
      if (metafield.namespace === 'custom' && metafield.key.startsWith('decoration_')) {
        // Process decoration method metafields
        const method = metafield.key.replace('decoration_', '');
        if (!config.decorationMethods[method]) {
          config.decorationMethods[method] = {};
        }
        config.decorationMethods[method][metafield.key] = metafield.value;
      }
    });
    
    res.json(config);
  } catch (error) {
    console.error('Product configuration error:', error);
    res.status(500).json({ error: 'Failed to fetch product configuration' });
  }
});

app.post('/api/price/calculate', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const { 
      decorationMethod, 
      quantity, 
      colorCounts, 
      locationCount,
      productId
    } = req.body;
    
    // Validate required parameters
    if (!decorationMethod || !quantity || !colorCounts || locationCount === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Validate decoration method
    if (decorationMethod !== 'screenprint' && decorationMethod !== 'embroidery') {
      return res.status(400).json({ error: 'Invalid decoration method' });
    }
    
    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    
    // Validate color counts
    if (!Array.isArray(colorCounts)) {
      return res.status(400).json({ error: 'Color counts must be an array' });
    }
    
    // Validate location count
    if (isNaN(locationCount) || locationCount < 0) {
      return res.status(400).json({ error: 'Invalid location count' });
    }
    
    // Fetch product metafields for pricing configuration
    let productMetafields = null;
    if (productId) {
      const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
      const response = await client.get({
        path: `products/${productId}/metafields`,
      });
      productMetafields = response.body.metafields;
    }
    
    // Calculate pricing based on metafields or use defaults
    let baseItemPrice, baseSetupFee, extraColorFee, extraSetupPerColor, extraSetupPerLocation, extraItemPerLocation;
    
    if (productMetafields) {
      // Extract pricing values from metafields
      const metafieldMap = {};
      productMetafields.forEach(metafield => {
        metafieldMap[metafield.key] = metafield.value;
      });
      
      baseItemPrice = parseFloat(metafieldMap[`base_item_price_${decorationMethod}`] || (decorationMethod === 'screenprint' ? 15.87 : 19.99));
      baseSetupFee = parseFloat(metafieldMap[`base_setup_fee_${decorationMethod}`] || 50);
      extraColorFee = parseFloat(metafieldMap['extra_color_fee'] || 2.04);
      extraSetupPerColor = parseFloat(metafieldMap['extra_setup_per_color'] || 25);
      extraSetupPerLocation = parseFloat(metafieldMap['extra_setup_per_location'] || 50);
      extraItemPerLocation = parseFloat(metafieldMap['extra_item_per_location'] || 8.08);
    } else {
      // Use default values if no product metafields
      baseItemPrice = decorationMethod === 'screenprint' ? 15.87 : 19.99;
      baseSetupFee = 50;
      extraColorFee = 2.04;
      extraSetupPerColor = 25;
      extraSetupPerLocation = 50;
      extraItemPerLocation = 8.08;
    }
    
    let totalExtraColors = 0;
    let additionalSetupFee = 0;
    let extraLocationCount = Math.max(0, locationCount - 1);
    
    // Calculate extra colors
    colorCounts.forEach((colorCount, index) => {
      if (index === 0) {
        // First print location: 1 color included
        if (colorCount > 1) {
          totalExtraColors += (colorCount - 1);
          additionalSetupFee += (colorCount - 1) * extraSetupPerColor;
        }
      } else {
        // Additional print locations
        if (colorCount > 1) {
          totalExtraColors += (colorCount - 1);
          additionalSetupFee += (colorCount - 1) * extraSetupPerColor;
        }
      }
    });
    
    // Add setup fee for extra locations
    additionalSetupFee += extraLocationCount * extraSetupPerLocation;
    
    const eachItem = baseItemPrice + (extraLocationCount * extraItemPerLocation) + (totalExtraColors * extraColorFee);
    const eachItemTotal = eachItem * quantity;
    const setupFee = baseSetupFee + additionalSetupFee;
    const total = eachItemTotal + setupFee;
    
    res.json({
      eachItem: parseFloat(eachItem.toFixed(2)),
      setupFee: parseFloat(setupFee.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
});

// API routes for design management
app.get('/api/designs', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    // Use Shopify Admin API to retrieve customer designs from metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    const query = `
      query {
        metaobjects(first: 100, type: "design") {
          nodes {
            id
            handle
            fields {
              key
              value
            }
          }
        }
      }
    `;
    
    const response = await client.query({
      data: query,
    });
    
    // Process the response to extract design data
    const designs = response.body.data.metaobjects.nodes.map(node => {
      const design = {
        id: node.handle,
      };
      
      node.fields.forEach(field => {
        design[field.key] = field.value;
      });
      
      return design;
    });
    
    res.json(designs);
  } catch (error) {
    console.error('Designs retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

app.get('/api/designs/:id', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const designId = req.params.id;
    
    // Validate required parameters
    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required' });
    }
    
    // Use Shopify Admin API to retrieve a specific design from metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    const query = `
      query {
        metaobject(handle: "${designId}", type: "design") {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    `;
    
    const response = await client.query({
      data: query,
    });
    
    // Process the response to extract design data
    const node = response.body.data.metaobject;
    const design = {
      id: node.handle,
    };
    
    node.fields.forEach(field => {
      design[field.key] = field.value;
    });
    
    res.json(design);
  } catch (error) {
    console.error('Design retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

app.post('/api/designs', shopify.ensureInstalledOnShop(), upload.array('designImages', 4), async (req, res) => {
  try {
    const { designData } = req.body;
    const files = req.files;
    
    // Validate required parameters
    if (!designData) {
      return res.status(400).json({ error: 'Design data is required' });
    }
    
    // Parse design data
    const parsedDesignData = JSON.parse(designData);
    
    // Use Shopify Admin API to save the design as a metaobject
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    
    // Prepare fields for metaobject creation
    const fields = [];
    Object.keys(parsedDesignData).forEach(key => {
      fields.push({
        key,
        value: typeof parsedDesignData[key] === 'string' 
          ? parsedDesignData[key] 
          : JSON.stringify(parsedDesignData[key])
      });
    });
    
    // Add file URLs to fields if files were uploaded
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        fields.push({
          key: `image_${index}`,
          value: `${process.env.HOST}/uploads/${file.filename}`
        });
      });
    }
    
    // Create metaobject mutation
    const mutation = `
      mutation {
        metaobjectCreate(metaobject: {
          type: "design",
          handle: "design-${Date.now()}-${Math.floor(Math.random() * 1000)}",
          fields: [${fields.map(field => `{key: "${field.key}", value: "${field.value}"}`).join(',')}]
        }) {
          metaobject {
            id
            handle
          }
          userErrors {
            field
            message
            }
        }
      }
    `;
    
    const response = await client.query({
      data: mutation,
    });
    
    if (response.body.data.metaobjectCreate.userErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Failed to create design',
        details: response.body.data.metaobjectCreate.userErrors 
      });
    }
    
    res.status(201).json({
      id: response.body.data.metaobjectCreate.metaobject.handle,
      ...parsedDesignData,
      images: files ? files.map(file => `${process.env.HOST}/uploads/${file.filename}`) : []
    });
  } catch (error) {
    console.error('Design save error:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

app.put('/api/designs/:id', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const designId = req.params.id;
    const { designData } = req.body;
    
    // Validate required parameters
    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required' });
    }
    
    if (!designData) {
      return res.status(400).json({ error: 'Design data is required' });
    }
    
    // Use Shopify Admin API to update the design metaobject
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    
    // Prepare fields for metaobject update
    const fields = [];
    Object.keys(designData).forEach(key => {
      fields.push({
        key,
        value: typeof designData[key] === 'string' 
          ? designData[key] 
          : JSON.stringify(designData[key])
      });
    });
    
    // Update metaobject mutation
    const mutation = `
      mutation {
        metaobjectUpdate(handle: "${designId}", type: "design", metaobject: {
          fields: [${fields.map(field => `{key: "${field.key}", value: "${field.value}"}`).join(',')}]
        }) {
          metaobject {
            id
            handle
          }
          userErrors {
            field
            message
            }
        }
      }
    `;
    
    const response = await client.query({
      data: mutation,
    });
    
    if (response.body.data.metaobjectUpdate.userErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Failed to update design',
        details: response.body.data.metaobjectUpdate.userErrors 
      });
    }
    
    res.json({
      id: designId,
      ...designData,
      updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Design update error:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// API routes for admin dashboard
app.get('/api/admin/designs/pending', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    // Use Shopify Admin API to retrieve pending designs from metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    const query = `
      query {
        metaobjects(first: 100, type: "design", query: "status:pending") {
          nodes {
            id
            handle
            fields {
              key
              value
            }
          }
        }
      }
    `;
    
    const response = await client.query({
      data: query,
    });
    
    // Process the response to extract pending design data
    const pendingDesigns = response.body.data.metaobjects.nodes.map(node => {
      const design = {
        id: node.handle,
      };
      
      node.fields.forEach(field => {
        design[field.key] = field.value;
      });
      
      return design;
    });
    
    res.json(pendingDesigns);
  } catch (error) {
    console.error('Pending designs retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch pending designs' });
  }
});

app.put('/api/admin/designs/:id/approve', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const designId = req.params.id;
    
    // Validate required parameters
    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required' });
    }
    
    // Use Shopify Admin API to update the design status in metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    
    // Update metaobject mutation
    const mutation = `
      mutation {
        metaobjectUpdate(handle: "${designId}", type: "design", metaobject: {
          fields: [{key: "status", value: "approved"}]
        }) {
          metaobject {
            id
            handle
          }
          userErrors {
            field
            message
            }
        }
      }
    `;
    
    const response = await client.query({
      data: mutation,
    });
    
    if (response.body.data.metaobjectUpdate.userErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Failed to approve design',
        details: response.body.data.metaobjectUpdate.userErrors 
      });
    }
    
    res.json({ 
      success: true, 
      message: `Design ${designId} approved successfully` 
    });
  } catch (error) {
    console.error('Design approval error:', error);
    res.status(500).json({ error: 'Failed to approve design' });
  }
});

app.put('/api/admin/designs/:id/reject', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const designId = req.params.id;
    const { reason } = req.body;
    
    // Validate required parameters
    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required' });
    }
    
    // Use Shopify Admin API to update the design status in metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    
    // Prepare fields for metaobject update
    const fields = [
      {key: "status", value: "rejected"}
    ];
    
    if (reason) {
      fields.push({key: "rejection_reason", value: reason});
    }
    
    // Update metaobject mutation
    const mutation = `
      mutation {
        metaobjectUpdate(handle: "${designId}", type: "design", metaobject: {
          fields: [${fields.map(field => `{key: "${field.key}", value: "${field.value}"}`).join(',')}]
        }) {
          metaobject {
            id
            handle
          }
          userErrors {
            field
            message
            }
        }
      }
    `;
    
    const response = await client.query({
      data: mutation,
    });
    
    if (response.body.data.metaobjectUpdate.userErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Failed to reject design',
        details: response.body.data.metaobjectUpdate.userErrors 
      });
    }
    
    res.json({ 
      success: true, 
      message: `Design ${designId} rejected successfully`,
      reason: reason
    });
  } catch (error) {
    console.error('Design rejection error:', error);
    res.status(500).json({ error: 'Failed to reject design' });
  }
});

app.get('/api/admin/orders', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    // Use Shopify Admin API to retrieve orders
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    const response = await client.get({
      path: 'orders',
      query: {
        status: 'any',
        limit: 50
      }
    });
    
    // Process orders to extract relevant information
    const orders = response.body.orders.map(order => ({
      id: order.name,
      customer: {
        name: `${order.customer.first_name} ${order.customer.last_name}`,
        email: order.customer.email
      },
      date: order.created_at,
      status: order.financial_status,
      total: order.total_price
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Orders retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// API routes for product setup wizard
app.get('/api/admin/products', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    // Use Shopify Admin API to retrieve products
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    const response = await client.get({
      path: 'products',
      query: {
        limit: 100
      }
    });
    
    // Process products to extract relevant information
    const products = response.body.products.map(product => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      image: product.image ? product.image.src : ''
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Products retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/admin/templates', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    // Use Shopify Admin API to retrieve product templates from metaobjects
    const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
    const query = `
      query {
        metaobjects(first: 100, type: "product_template") {
          nodes {
            id
            handle
            fields {
              key
              value
            }
          }
        }
      }
    `;
    
    const response = await client.query({
      data: query,
    });
    
    // Process the response to extract template data
    const templates = response.body.data.metaobjects.nodes.map(node => {
      const template = {
        id: node.handle,
      };
      
      node.fields.forEach(field => {
        template[field.key] = field.value;
      });
      
      return template;
    });
    
    res.json(templates);
  } catch (error) {
    console.error('Templates retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/admin/products/:id/setup', shopify.ensureInstalledOnShop(), upload.array('baseImages', 10), async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      templateId, 
      variantMapping, 
      printAreas, 
      pricing 
    } = req.body;
    const files = req.files;
    
    // Validate required parameters
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Use Shopify Admin API to save all the product configuration as metafields
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    
    // Prepare metafields to be created
    const metafields = [];
    
    // Add template reference
    metafields.push({
      namespace: 'custom',
      key: 'product_template',
      value: templateId,
      type: 'single_line_text_field'
    });
    
    // Add print area configurations
    if (printAreas) {
      Object.keys(printAreas).forEach(area => {
        metafields.push({
          namespace: 'custom',
          key: `print_area_${area}`,
          value: JSON.stringify(printAreas[area]),
          type: 'json'
        });
      });
    }
    
    // Add pricing configurations
    if (pricing) {
      Object.keys(pricing).forEach(method => {
        metafields.push({
          namespace: 'custom',
          key: `pricing_${method}`,
          value: JSON.stringify(pricing[method]),
          type: 'json'
        });
      });
    }
    
    // Create metafields for the product
    for (const metafield of metafields) {
      try {
        await client.post({
          path: `products/${productId}/metafields`,
          data: { metafield }
        });
      } catch (error) {
        console.error(`Failed to create metafield ${metafield.key}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Product ${productId} configured successfully`,
      productId: productId,
      images: files ? files.map(file => `${process.env.HOST}/uploads/${file.filename}`) : []
    });
  } catch (error) {
    console.error('Product setup error:', error);
    res.status(500).json({ error: 'Failed to setup product' });
  }
});

// API routes for product side configurations
app.get('/api/admin/products/:id/side-config', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate required parameters
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Use Shopify Admin API to retrieve product side configuration metafields
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    const productMetafields = await client.get({
      path: `products/${productId}/metafields`,
    });
    
    // Process metafields to create side configuration
    const sideConfig = {
      sides: {}
    };
    
    // Extract relevant metafields for side configurations
    productMetafields.body.metafields.forEach(metafield => {
      if (metafield.namespace === 'custom' && metafield.key.startsWith('side_')) {
        // Parse side configuration metafields
        const parts = metafield.key.split('_');
        const side = parts[1]; // front, back, left, right
        const configType = parts.slice(2).join('_'); // color_options, decoration_methods, upload_section
        
        if (!sideConfig.sides[side]) {
          sideConfig.sides[side] = {
            colorOptions: [],
            decorationMethods: [],
            uploadSection: {}
          };
        }
        
        // Process different configuration types
        if (configType === 'color_options') {
          try {
            sideConfig.sides[side].colorOptions = JSON.parse(metafield.value);
          } catch (e) {
            sideConfig.sides[side].colorOptions = [];
          }
        } else if (configType === 'decoration_methods') {
          try {
            sideConfig.sides[side].decorationMethods = JSON.parse(metafield.value);
          } catch (e) {
            sideConfig.sides[side].decorationMethods = [];
          }
        } else if (configType === 'upload_section') {
          try {
            sideConfig.sides[side].uploadSection = JSON.parse(metafield.value);
          } catch (e) {
            sideConfig.sides[side].uploadSection = {};
          }
        }
      }
    });
    
    res.json(sideConfig);
  } catch (error) {
    console.error('Product side configuration retrieval error:', error);
    res.status(500).json({ error: 'Failed to fetch product side configuration' });
  }
});

app.post('/api/admin/products/:id/side-config', shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const productId = req.params.id;
    const { sides } = req.body;
    
    // Validate required parameters
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (!sides) {
      return res.status(400).json({ error: 'Side configurations are required' });
    }
    
    // Use Shopify Admin API to save side configurations as metafields
    const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
    
    // Prepare metafields to be created/updated
    const metafields = [];
    
    // Process each side configuration
    Object.keys(sides).forEach(side => {
      const sideConfig = sides[side];
      
      // Add color options metafield
      metafields.push({
        namespace: 'custom',
        key: `side_${side}_color_options`,
        value: JSON.stringify(sideConfig.colorOptions || []),
        type: 'json'
      });
      
      // Add decoration methods metafield
      metafields.push({
        namespace: 'custom',
        key: `side_${side}_decoration_methods`,
        value: JSON.stringify(sideConfig.decorationMethods || []),
        type: 'json'
      });
      
      // Add upload section metafield
      metafields.push({
        namespace: 'custom',
        key: `side_${side}_upload_section`,
        value: JSON.stringify(sideConfig.uploadSection || {}),
        type: 'json'
      });
    });
    
    // Delete existing side configuration metafields
    const existingMetafields = await client.get({
      path: `products/${productId}/metafields`,
    });
    
    const sideMetafieldsToDelete = existingMetafields.body.metafields
      .filter(mf => mf.namespace === 'custom' && mf.key.startsWith('side_'))
      .map(mf => mf.id);
    
    // Delete existing side metafields
    for (const metafieldId of sideMetafieldsToDelete) {
      try {
        await client.delete({
          path: `metafields/${metafieldId}`,
        });
      } catch (error) {
        console.error(`Failed to delete metafield ${metafieldId}:`, error);
      }
    }
    
    // Create new metafields for the product
    for (const metafield of metafields) {
      try {
        await client.post({
          path: `products/${productId}/metafields`,
          data: { metafield }
        });
      } catch (error) {
        console.error(`Failed to create metafield ${metafield.key}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Product ${productId} side configurations saved successfully`
    });
  } catch (error) {
    console.error('Product side configuration save error:', error);
    res.status(500).json({ error: 'Failed to save product side configuration' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Host: ${process.env.HOST}`);
});