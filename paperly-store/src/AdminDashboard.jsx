import { useState, useEffect } from 'react';

function AdminDashboard({ products, setProducts, orders, setOrders, onLogout }) {
  const [adminTab, setAdminTab] = useState('orders');
  const [newProd, setNewProd] = useState({ name: '', price: '', categoryId: '1', stockQuantity: 0 });
  const [dbCategories, setDbCategories] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:5069/api/categories")
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => {
        setDbCategories([
          { categoryId: 1, categoryName: 'Art' },
          { categoryId: 2, categoryName: 'Books' },
          { categoryId: 3, categoryName: 'Desk Organizers' },
          { categoryId: 4, categoryName: 'Notebooks' },
          { categoryId: 5, categoryName: 'Pens and pencils' }
        ]);
      });
  }, []);

  // Fetch all orders (admin)
  const fetchAllOrders = async () => {
    try {
      const response = await fetch("http://localhost:5069/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Could not fetch admin orders:", err);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Refresh products from DB
  const refreshProducts = async () => {
    try {
      const response = await fetch("http://localhost:5069/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const formattedProducts = data.map(p => ({
        id: p.productId,
        name: p.productName,
        price: p.price,
        categoryId: p.categoryId,
        stockQuantity: p.stockQuantity,
        category: dbCategories.find(c => c.categoryId === p.categoryId)?.categoryName || 'Art'
      }));
      setProducts(formattedProducts);
    } catch (err) {
      console.error("Error refreshing products:", err);
      alert("Could not refresh inventory");
    }
  };

  useEffect(() => {
    if (adminTab === 'inventory') {
      refreshProducts();
    }
  }, [adminTab]);

  const calculateTotalSales = () => {
    return orders.reduce((sum, order) => {
      if (order.total) return sum + order.total;
      const computed = order.items ? order.items.reduce((s, i) => s + (i.quantity * (i.unitPrice || i.price)), 0) : 0;
      return sum + computed;
    }, 0);
  };

  const getStatusColor = (statusId) => {
    switch(statusId) {
      case 1: return { bg: '#fef3c7', text: '#92400e', label: 'Pending' };
      case 2: return { bg: '#dbeafe', text: '#1e40af', label: 'Processing' };
      case 3: return { bg: '#e0e7ff', text: '#3730a3', label: 'Shipped' };
      case 4: return { bg: '#d1fae5', text: '#065f46', label: 'Delivered' };
      default: return { bg: '#f3f4f6', text: '#374151', label: 'Unknown' };
    }
  };

  const handleStatusChange = async (orderId, newStatusId) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`http://localhost:5069/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: parseInt(newStatusId) })
      });
      if (!response.ok) throw new Error("Failed to update status on server");
      const updatedOrder = await response.json();
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          const id = order.orderId || order.id;
          if (id === orderId) {
            return { 
              ...order, 
              statusId: updatedOrder.statusId, 
              statusName: updatedOrder.statusName
            };
          }
          return order;
        })
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    const cleanPriceValue = parseFloat(newProd.price.toString().replace('$', ''));
    if (isNaN(cleanPriceValue)) return;

    const stockQty = parseInt(newProd.stockQuantity);
    if (isNaN(stockQty) || stockQty < 0) {
      alert("Please enter a valid stock quantity (0 or more).");
      return;
    }

    const backendPayload = {
      productName: newProd.name,
      price: cleanPriceValue,
      categoryId: parseInt(newProd.categoryId),
      stockQuantity: stockQty
    };

    try {
      const response = await fetch('http://localhost:5069/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload)
      });
      if (!response.ok) throw new Error("Failed to add product.");
      const savedProduct = await response.json();
      const formattedProduct = {
        id: savedProduct.productId,
        name: savedProduct.productName,
        price: savedProduct.price,
        categoryId: savedProduct.categoryId,
        stockQuantity: savedProduct.stockQuantity,
        category: dbCategories.find(c => c.categoryId === savedProduct.categoryId)?.categoryName || 'Art'
      };
      setProducts([formattedProduct, ...products]);
      setNewProd({ name: '', price: '', categoryId: '1', stockQuantity: 0 });
      setAdminTab('inventory');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5069/api/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Could not remove product.");
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="screen" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Admin Dashboard</h2>
        <button className="tab" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={onLogout}>Log Out</button>
      </div>

      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ margin: 0, padding: '16px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Total Revenue</span>
          <h3 style={{ fontSize: '24px', color: '#15803d', marginTop: '4px' }}>${calculateTotalSales().toFixed(2)}</h3>
        </div>
        <div className="card" style={{ margin: 0, padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Orders</span>
          <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{orders.length}</h3>
        </div>
      </div>

      <div className="tab-row" style={{ marginBottom: '20px' }}>
        <button className={`tab ${adminTab === 'orders' ? 'active' : ''}`} onClick={() => setAdminTab('orders')}>Orders</button>
        <button className={`tab ${adminTab === 'inventory' ? 'active' : ''}`} onClick={() => setAdminTab('inventory')}>Inventory</button>
      </div>

      {adminTab === 'orders' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No orders yet.</p> : 
            orders.map(order => {
              const currentId = order.orderId || order.id;
              const currentStatusId = order.statusId || 1;
              const statusInfo = getStatusColor(currentStatusId);
              const displayAddress = order.address 
                ? `${order.address.addressLine || ''}, ${order.address.city || ''}` 
                : (order.shippingAddress || 'No Address Logged');
              return (
                <div key={currentId} className="card" style={{ margin: 0, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <strong>Order #{currentId}</strong>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ 
                        backgroundColor: statusInfo.bg, 
                        color: statusInfo.text, 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600'
                      }}>
                        {statusInfo.label}
                      </span>
                      <select 
                        value={currentStatusId} 
                        onChange={(e) => handleStatusChange(currentId, e.target.value)}
                        disabled={updatingStatus === currentId}
                        style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          background: '#fff', 
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          minWidth: '130px'
                        }}
                      >
                        <option value="1">Pending</option>
                        <option value="2">Processing</option>
                        <option value="3">Shipped</option>
                        <option value="4">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 8px 0' }}>
                    📦 Shipping: {displayAddress}
                  </p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    {order.items && order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                        <span>{item.productName || item.name} <strong>x{item.quantity}</strong></span>
                        <span>${(item.unitPrice || item.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: '6px', fontSize: '13px', fontWeight: '700', color: '#1D9E75' }}>
                      Total: ${(order.total || (order.items && order.items.reduce((acc, curr) => acc + (curr.quantity * (curr.unitPrice || curr.price)), 0)) || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Inventory Management</h3>
            <button className="tab" onClick={refreshProducts} style={{ padding: '6px 12px', fontSize: '12px' }}>
              🔄 Refresh Stock
            </button>
          </div>

          <form onSubmit={handleAddProduct} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '10px 0 20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="form-input" placeholder="Product Name" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required />
              <input className="form-input" placeholder="Price (e.g., 15.50)" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required />
              <input className="form-input" type="number" min="0" placeholder="Stock Quantity" value={newProd.stockQuantity} onChange={(e) => setNewProd({ ...newProd, stockQuantity: e.target.value })} required />
              <select className="form-input" value={newProd.categoryId} onChange={(e) => setNewProd({ ...newProd, categoryId: e.target.value })}>
                {dbCategories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
              <button type="submit" className="teal-btn" style={{ marginTop: '4px' }}>Add Product</button>
            </div>
          </form>

          <h4>Products ({products.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {products.map(product => (
              <div key={product.id} className="menu-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                <div>
                  <span style={{ fontWeight: '600' }}>{product.name}</span>
                  <span style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>
                    Category: {product.category} — Price: <strong>${(product.price || 0).toFixed(2)}</strong> — 
                    Stock: <strong style={{ color: (product.stockQuantity || 0) <= 0 ? '#ef4444' : '#1D9E75' }}>
                      {product.stockQuantity ?? 0} left
                    </strong>
                  </span>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: '4px 8px' }} onClick={() => handleDeleteProduct(product.id)}>
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;