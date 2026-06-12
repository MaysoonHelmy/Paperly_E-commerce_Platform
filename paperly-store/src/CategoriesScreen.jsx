import { useState, useEffect } from 'react';

function CategoriesScreen({ cart, addToCart, decrementCart, products = [] }) {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5069/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data && data.length > 0) {
          setActiveCategoryId(data[0].categoryId); 
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="screen">Loading Categories...</div>;

  const activeCategory = categories.find(c => c.categoryId === activeCategoryId);
  const filteredProducts = products.filter(p => p.categoryId === activeCategoryId);

  return (
    <div className="screen">
      <h2>Browse Categories</h2>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', background: '#f8fafc', padding: '8px', borderRadius: '10px' }}>
        {categories.map(cat => (
          <button
            key={cat.categoryId}
            className={`tab ${activeCategoryId === cat.categoryId ? 'active' : ''}`}
            style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap', textTransform: 'capitalize' }}
            onClick={() => setActiveCategoryId(cat.categoryId)}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      <h3>{activeCategory?.categoryName || 'Products'}</h3>
      
      <div className="prod-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const cartItem = cart[product.id];
            const quantity = cartItem ? cartItem.quantity : 0;
            const isChosen = quantity > 0;

            return (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{product.name}</p>
                  <p style={{ color: isChosen ? '#085041' : '#64748b', fontWeight: '600', fontSize: '13px', marginTop: '4px' }}>
                    ${(product.price || 0).toFixed(2)}
                  </p>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button className="tab" style={{ padding: '4px 12px', border: '1px solid #1D9E75' }} onClick={() => decrementCart(product.id)}>−</button>
                      <strong style={{ color: '#085041' }}>{quantity}</strong>
                      <button className="tab" style={{ padding: '4px 12px', border: '1px solid #1D9E75' }} onClick={() => addToCart(product)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#64748b', fontSize: '13px' }}>No products in this category.</p>
        )}
      </div>
    </div>
  );
}

export default CategoriesScreen;