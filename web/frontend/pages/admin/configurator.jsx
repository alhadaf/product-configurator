import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Tabs,
  Button,
  DataTable,
  Badge,
  Stack,
  TextContainer,
  DisplayText,
  Heading
} from '@shopify/polaris';

export default function AdminConfigurator() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [designs, setDesigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const tabs = [
    {
      id: 'dashboard',
      content: 'Dashboard',
      panelID: 'dashboard-panel'
    },
    {
      id: 'setup-wizard',
      content: 'Product Setup',
      panelID: 'setup-wizard-panel'
    },
    {
      id: 'design-review',
      content: 'Design Review',
      panelID: 'design-review-panel'
    },
    {
      id: 'side-config',
      content: 'Side Configurations',
      panelID: 'side-config-panel'
    },
    {
      id: 'orders',
      content: 'Orders',
      panelID: 'orders-panel'
    }
  ];

  useEffect(() => {
    // Load initial data
    fetchPendingDesigns();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchPendingDesigns = async () => {
    try {
      const response = await fetch('/api/admin/designs/pending');
      const data = await response.json();
      setDesigns(data.designs || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const renderDashboard = () => (
    <Layout>
      <Layout.Section oneThird>
        <Card title="Pending Designs" sectioned>
          <TextContainer>
            <DisplayText size="large">{designs.length}</DisplayText>
            <p>Designs awaiting approval</p>
          </TextContainer>
        </Card>
      </Layout.Section>
      <Layout.Section oneThird>
        <Card title="Configured Products" sectioned>
          <TextContainer>
            <DisplayText size="large">{products.length}</DisplayText>
            <p>Products ready for customization</p>
          </TextContainer>
        </Card>
      </Layout.Section>
      <Layout.Section oneThird>
        <Card title="Recent Orders" sectioned>
          <TextContainer>
            <DisplayText size="large">{orders.length}</DisplayText>
            <p>Orders with custom designs</p>
          </TextContainer>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSetupWizard = () => (
    <Card title="Product Setup Wizard" sectioned>
      <Stack vertical>
        <Heading>Configure Products for Customization</Heading>
        <p>Set up products with print areas, pricing, and decoration methods.</p>
        <Button primary onClick={() => window.open('/admin/setup-wizard', '_blank')}>
          Launch Setup Wizard
        </Button>
      </Stack>
    </Card>
  );

  const renderDesignReview = () => {
    const designRows = designs.map(design => [
      design.id,
      design.customer_name || 'Anonymous',
      design.product_title,
      <Badge status={design.status === 'pending' ? 'attention' : 'success'}>
        {design.status}
      </Badge>,
      design.created_at,
      <Stack>
        <Button size="slim" onClick={() => approveDesign(design.id)}>
          Approve
        </Button>
        <Button size="slim" destructive onClick={() => rejectDesign(design.id)}>
          Reject
        </Button>
      </Stack>
    ]);

    return (
      <Card title="Design Review Queue" sectioned>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
          headings={['ID', 'Customer', 'Product', 'Status', 'Created', 'Actions']}
          rows={designRows}
        />
      </Card>
    );
  };

  const approveDesign = async (designId) => {
    try {
      await fetch(`/api/admin/designs/${designId}/approve`, { method: 'PUT' });
      fetchPendingDesigns();
    } catch (error) {
      console.error('Error approving design:', error);
    }
  };

  const rejectDesign = async (designId) => {
    try {
      await fetch(`/api/admin/designs/${designId}/reject`, { method: 'PUT' });
      fetchPendingDesigns();
    } catch (error) {
      console.error('Error rejecting design:', error);
    }
  };

  const renderSideConfig = () => (
    <Card title="Product Side Configurations" sectioned>
      <Stack vertical>
        <Heading>Configure Product Sides</Heading>
        <p>Set up colors, decoration methods, and upload settings for each product side.</p>
        <Button primary onClick={() => window.open('/admin/side-config', '_blank')}>
          Configure Product Sides
        </Button>
      </Stack>
    </Card>
  );

  const renderOrders = () => {
    const orderRows = orders.map(order => [
      order.id,
      order.customer_name,
      order.total_price,
      order.design_count,
      <Badge status="success">{order.status}</Badge>,
      order.created_at
    ]);

    return (
      <Card title="Orders with Custom Designs" sectioned>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
          headings={['Order ID', 'Customer', 'Total', 'Designs', 'Status', 'Date']}
          rows={orderRows}
        />
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: return renderDashboard();
      case 1: return renderSetupWizard();
      case 2: return renderDesignReview();
      case 3: return renderSideConfig();
      case 4: return renderOrders();
      default: return renderDashboard();
    }
  };

  return (
    <Page
      title="Product Configurator Admin"
      subtitle="Manage custom product configurations and designs"
    >
      <Tabs
        tabs={tabs}
        selected={selectedTab}
        onSelect={setSelectedTab}
      >
        <Card.Section>
          {renderTabContent()}
        </Card.Section>
      </Tabs>
    </Page>
  );
}