import { useState, useEffect } from 'react';
import './App.css';
import AuthScreen from './AuthScreen';
import HomeScreen from './HomeScreen';
import CategoriesScreen from './CategoriesScreen';
import CartScreen from './CartScreen';
import OrdersScreen from './OrdersScreen';
import ProfileScreen from './ProfileScreen';
import AdminDashboard from './AdminDashboard'; 

function App() {
  const [user, setUser] = useState(() => {
    try { const saved = localStorage.getItem('user'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user'));
  const [role, setRole] = useState(() => {
    try { const saved = localStorage.getItem('user'); return saved ? JSON.parse(saved).role : 'user'; } catch { return 'user'; }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]); 
  const [cart, setCart] = useState({}); 
  const [products, setProducts] = useState([]);

  const loadUserAddresses = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5069/api/addresses/user/${userId}`);
      if (response.ok) setAddresses(await response.json());
    } catch (err) { console.error("Error loading addresses:", err); }
  };

  const loadUserOrders = async (userId) => {
    try {
        const response = await fetch(`http://localhost:5069/api/orders/user/${userId}`);
        if (response.ok) setOrders(await response.json());
        if (role === 'Admin') {
            const adminRes = await fetch(`http://localhost:5069/api/orders`);
            if (adminRes.ok) setOrders(await adminRes.json());
        }
    } catch (err) { console.error("Error loading orders:", err); }
  };

  useEffect(() => {
    fetch("http://localhost:5069/api/products")
      .then(response => response.json())
      .then(data => setProducts(data.map(p => ({ id: p.productId, name: p.productName, price: p.price, categoryId: p.categoryId, category: p.categoryName || 'Art' }))))
      .catch(err => console.error("Error fetching products:", err));
    
    if (user && user.id) {
        loadUserOrders(user.id);
        loadUserAddresses(user.id);
    }
  }, [user]);

  const totalCartItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const handleLogout = () => { setIsLoggedIn(false); setUser(null); setRole('user'); localStorage.removeItem('user'); setCart({}); setActiveTab('home'); };

  if (!isLoggedIn) return <AuthScreen onLogin={() => setIsLoggedIn(true)} setUser={setUser} setRole={setRole} />;

  return (
    <div className="wrap">
      {role === 'Admin' ? (
        <AdminDashboard products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} onLogout={handleLogout} />
      ) : (
        <>
          <div className="tab-row">
            {['home', 'categories', 'cart', 'orders', 'profile'].map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} 
                {tab === 'cart' && totalCartItems > 0 && ` (${totalCartItems})`}
              </button>
            ))}
          </div>

          <div id="screens">
            {activeTab === 'home' && <HomeScreen user={user} cart={cart} addToCart={(p)=>setCart(prev=>({...prev, [p.id]:{...p, quantity:(prev[p.id]?.quantity||0)+1}}))} decrementCart={(id)=>setCart(prev=>{const n={...prev}; if(n[id].quantity>1) n[id].quantity--; else delete n[id]; return n;})} products={products} />}
            {activeTab === 'categories' && <CategoriesScreen cart={cart} addToCart={(p)=>setCart(prev=>({...prev, [p.id]:{...p, quantity:(prev[p.id]?.quantity||0)+1}}))} decrementCart={(id)=>setCart(prev=>{const n={...prev}; if(n[id].quantity>1) n[id].quantity--; else delete n[id]; return n;})} products={products} />}
            {activeTab === 'cart' && (
              <CartScreen 
                cart={cart} setCart={setCart} 
                addToCart={(p)=>setCart(prev=>({...prev, [p.id]:{...p, quantity:(prev[p.id]?.quantity||0)+1}}))}
                decrementCart={(id)=>setCart(prev=>{const n={...prev}; if(n[id].quantity>1) n[id].quantity--; else delete n[id]; return n;})}
                setOrders={setOrders} orders={orders} setActiveTab={setActiveTab} 
                user={user} setUser={setUser} addresses={addresses} setAddresses={setAddresses} loadUserOrders={loadUserOrders}  
              />
            )}
            {activeTab === 'orders' && <OrdersScreen orders={orders} />}
            {activeTab === 'profile' && <ProfileScreen user={user} setUser={setUser} addresses={addresses} setAddresses={setAddresses} onLogout={handleLogout} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;