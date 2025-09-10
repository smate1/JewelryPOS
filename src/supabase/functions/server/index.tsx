import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Authentication helper
async function authenticate(request: Request) {
  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return { user: null, error: 'No access token provided' };
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return { user: null, error: 'Invalid access token' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

// Products endpoints
app.get('/make-server-06ac22f4/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products.map(p => p.value) });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

app.post('/make-server-06ac22f4/products', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const product = await c.req.json();
    product.id = product.id || `prod-${Date.now()}`;
    product.createdAt = new Date().toISOString();
    product.createdBy = user.id;

    await kv.set(`product:${product.id}`, product);
    return c.json({ product });
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

app.put('/make-server-06ac22f4/products/:id', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`product:${id}`, updated);
    return c.json({ product: updated });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

app.delete('/make-server-06ac22f4/products/:id', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Customers endpoints
app.get('/make-server-06ac22f4/customers', async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ customers: customers.map(c => c.value) });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

app.post('/make-server-06ac22f4/customers', async (c) => {
  try {
    const customer = await c.req.json();
    customer.id = customer.id || `cust-${Date.now()}`;
    customer.createdAt = new Date().toISOString();
    customer.totalPurchases = customer.totalPurchases || 0;

    await kv.set(`customer:${customer.id}`, customer);
    return c.json({ customer });
  } catch (error) {
    console.log('Error creating customer:', error);
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

app.put('/make-server-06ac22f4/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`customer:${id}`);
    if (!existing) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`customer:${id}`, updated);
    return c.json({ customer: updated });
  } catch (error) {
    console.log('Error updating customer:', error);
    return c.json({ error: 'Failed to update customer' }, 500);
  }
});

// Sales/Receipts endpoints
app.post('/make-server-06ac22f4/sales', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const sale = await c.req.json();
    sale.id = `sale-${Date.now()}`;
    sale.timestamp = new Date().toISOString();
    sale.cashierId = user.id;

    // Update product stock
    for (const item of sale.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        product.inStock = Math.max(0, product.inStock - item.quantity);
        await kv.set(`product:${item.productId}`, product);
      }
    }

    // Update customer total purchases if applicable
    if (sale.customerId) {
      const customer = await kv.get(`customer:${sale.customerId}`);
      if (customer) {
        customer.totalPurchases = (customer.totalPurchases || 0) + sale.total;
        await kv.set(`customer:${sale.customerId}`, customer);
      }
    }

    await kv.set(`sale:${sale.id}`, sale);
    return c.json({ sale });
  } catch (error) {
    console.log('Error creating sale:', error);
    return c.json({ error: 'Failed to create sale' }, 500);
  }
});

app.get('/make-server-06ac22f4/sales', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const sales = await kv.getByPrefix('sale:');
    return c.json({ sales: sales.map(s => s.value) });
  } catch (error) {
    console.log('Error fetching sales:', error);
    return c.json({ error: 'Failed to fetch sales' }, 500);
  }
});

// Stock movements endpoints
app.post('/make-server-06ac22f4/stock-movements', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const movement = await c.req.json();
    movement.id = `mov-${Date.now()}`;
    movement.timestamp = new Date().toISOString();
    movement.performedBy = user.id;
    movement.status = 'pending';

    await kv.set(`movement:${movement.id}`, movement);
    return c.json({ movement });
  } catch (error) {
    console.log('Error creating stock movement:', error);
    return c.json({ error: 'Failed to create stock movement' }, 500);
  }
});

app.get('/make-server-06ac22f4/stock-movements', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const movements = await kv.getByPrefix('movement:');
    return c.json({ movements: movements.map(m => m.value) });
  } catch (error) {
    console.log('Error fetching stock movements:', error);
    return c.json({ error: 'Failed to fetch stock movements' }, 500);
  }
});

app.put('/make-server-06ac22f4/stock-movements/:id', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`movement:${id}`);
    if (!existing) {
      return c.json({ error: 'Movement not found' }, 404);
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    
    // If movement is being completed, update product location
    if (updates.status === 'completed' && existing.status === 'pending') {
      const product = await kv.get(`product:${existing.productId}`);
      if (product) {
        product.storeLocation = existing.toLocation;
        await kv.set(`product:${existing.productId}`, product);
      }
    }

    await kv.set(`movement:${id}`, updated);
    return c.json({ movement: updated });
  } catch (error) {
    console.log('Error updating stock movement:', error);
    return c.json({ error: 'Failed to update stock movement' }, 500);
  }
});

// Metal tracking endpoints
app.post('/make-server-06ac22f4/metal-transactions', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const metalTransaction = await c.req.json();
    metalTransaction.id = `metal-${Date.now()}`;
    metalTransaction.timestamp = new Date().toISOString();
    metalTransaction.processedBy = user.id;

    await kv.set(`metal:${metalTransaction.id}`, metalTransaction);
    return c.json({ metalTransaction });
  } catch (error) {
    console.log('Error creating metal transaction:', error);
    return c.json({ error: 'Failed to create metal transaction' }, 500);
  }
});

app.get('/make-server-06ac22f4/metal-summary', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const metalTransactions = await kv.getByPrefix('metal:');
    
    // Calculate weighted averages for each metal type
    const summary: Record<string, { totalWeight: number; totalValue: number; avgPrice: number }> = {};
    
    for (const transaction of metalTransactions) {
      const { metalType, weight, pricePerGram } = transaction.value;
      
      if (!summary[metalType]) {
        summary[metalType] = { totalWeight: 0, totalValue: 0, avgPrice: 0 };
      }
      
      summary[metalType].totalWeight += weight;
      summary[metalType].totalValue += weight * pricePerGram;
    }
    
    // Calculate weighted average prices
    for (const metalType in summary) {
      const data = summary[metalType];
      data.avgPrice = data.totalWeight > 0 ? data.totalValue / data.totalWeight : 0;
    }

    return c.json({ metalSummary: summary });
  } catch (error) {
    console.log('Error fetching metal summary:', error);
    return c.json({ error: 'Failed to fetch metal summary' }, 500);
  }
});

// User signup endpoint
app.post('/make-server-06ac22f4/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Error during signup:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Settings endpoints
app.get('/make-server-06ac22f4/settings', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const settings = await kv.get('system:settings') || {
      fiscal: {
        checkboxEnabled: true,
        taxRate: 20,
        companyName: 'ТОВ "Ювелірний світ"',
        companyAddress: 'м. Київ, вул. Хрещатик, 1',
        taxNumber: '12345678'
      },
      currency: {
        baseCurrency: 'UAH',
        exchangeRates: { USD: 37.5, EUR: 40.2 },
        autoUpdateRates: true
      },
      printing: {
        receiptPrinter: 'Epson TM-T20II',
        labelPrinter: 'Zebra ZD220',
        autoprint: true
      }
    };

    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put('/make-server-06ac22f4/settings', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const settings = await c.req.json();
    await kv.set('system:settings', settings);
    return c.json({ settings });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Reports endpoint
app.get('/make-server-06ac22f4/reports/sales-summary', async (c) => {
  try {
    const { user, error: authError } = await authenticate(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const fromDate = c.req.query('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = c.req.query('to') || new Date().toISOString();

    const sales = await kv.getByPrefix('sale:');
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.value.timestamp);
      return saleDate >= new Date(fromDate) && saleDate <= new Date(toDate);
    });

    const summary = {
      totalSales: filteredSales.reduce((sum, sale) => sum + sale.value.total, 0),
      totalTransactions: filteredSales.length,
      avgTransactionValue: filteredSales.length > 0 
        ? filteredSales.reduce((sum, sale) => sum + sale.value.total, 0) / filteredSales.length 
        : 0,
      salesByDate: {} as Record<string, number>
    };

    // Group sales by date
    for (const sale of filteredSales) {
      const date = new Date(sale.value.timestamp).toISOString().split('T')[0];
      summary.salesByDate[date] = (summary.salesByDate[date] || 0) + sale.value.total;
    }

    return c.json({ summary });
  } catch (error) {
    console.log('Error generating sales report:', error);
    return c.json({ error: 'Failed to generate sales report' }, 500);
  }
});

app.get('/make-server-06ac22f4/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

serve(app.fetch);