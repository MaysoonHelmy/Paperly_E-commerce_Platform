function HomeScreen({ user, cart, addToCart, decrementCart, products }) {
  if (!user || !products) return <div className="screen">Loading...</div>;

  return (
    <div className="screen">
      <h2>Welcome, {user.name || 'Shopper'}!</h2>
      <div className="hero" style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: '24px', 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #E1F5EE 0%, #f8fafc 100%)',
        border: '1px solid #cdeae1'
        }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ color: '#085041', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>
        Crafted for Creators
        </h3>
        <p style={{ color: '#1D9E75', fontSize: '14px', margin: 0, fontWeight: '500' }}>
          Smart Tools for Sharp Minds.
        </p>
        </div>
    </div>

      <div className="prod-grid">
        {products.map(product => {
          const cartItem = cart[product.id];
          const quantity = cartItem ? cartItem.quantity : 0;
          const isChosen = quantity > 0;

          return (
            <div 
              key={product.id} 
              className="product-card"
              style={{
                background: isChosen ? '#E1F5EE' : '#fff',
                borderColor: isChosen ? '#1D9E75' : '#e2e8f0',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <div>
                <div className="product-img" style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px' }}>
                  {isChosen && (
                    <span className="tab active" style={{ padding: '2px 8px', fontSize: '11px', pointerEvents: 'none', height: 'fit-content' }}>
                      x{quantity}
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{product.name}</h4>
                <p style={{ fontSize: '13px', color: isChosen ? '#085041' : '#64748b', fontWeight: '600' }}>${(product.price || 0).toFixed(2)}</p>
              </div>

              <div style={{ marginTop: '12px' }}>
                {!isChosen ? (
                  <button 
                    className="teal-btn" 
                    style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <button 
                      className="tab" 
                      style={{ padding: '4px 12px', background: '#fff' }}
                      onClick={() => decrementCart(product.id)}
                    >
                      -
                    </button>
                    <strong style={{ fontSize: '14px', color: '#085041' }}>{quantity}</strong>
                    <button 
                      className="tab" 
                      style={{ padding: '4px 12px', background: '#fff' }}
                      onClick={() => addToCart(product)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HomeScreen;