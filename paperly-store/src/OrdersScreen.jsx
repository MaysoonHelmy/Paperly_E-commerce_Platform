function OrdersScreen({ orders }) {
  return (
    <div className="screen">
      <h2>My Orders</h2>
      {!orders || orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const displayId = order.orderId || order.id;
            const displayDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Recent';
            const statusLabel = order.statusName || order.status || 'Pending';
            
            return (
              <div key={displayId} className="card" style={{ margin: 0, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>Order #{displayId}</strong>
                  <span className="tab active" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', pointerEvents: 'none' }}>
                    {statusLabel}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Placed on {displayDate}</p>
                
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px' }}>
                  {order.items && order.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '4px 0', color: '#475569' }}>
                      <span>{item.productName || item.name} <strong style={{ color: '#1D9E75' }}>x{item.quantity}</strong></span>
                      <span>${(item.unitPrice || item.price || 0).toFixed(2)} each</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Amount Paid:</span>
                  <strong style={{ color: '#1D9E75', fontSize: '15px' }}>
                    ${(order.total || (order.items && order.items.reduce((acc, curr) => acc + (curr.quantity * (curr.unitPrice || curr.price)), 0)) || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersScreen;