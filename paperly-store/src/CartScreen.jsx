import { useState } from 'react';

function CartScreen({ cart, setCart, addToCart, decrementCart, setOrders, orders, setActiveTab, user, setUser, addresses, setAddresses, loadUserOrders }) {
    const [view, setView] = useState('cart');
    const lastAddress = addresses.length > 0 ? addresses[addresses.length - 1] : null;

    const [shipping, setShipping] = useState({ 
        addressLine: lastAddress?.addressLine || '', 
        city: lastAddress?.city || '', 
        postalCode: lastAddress?.postalCode || '',
        phone: user?.phone || ''   
    });

    const cartItems = Object.values(cart);
    const currentUserId = user?.userId || user?.id;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!user || !currentUserId) return alert("Please log in.");

        if (shipping.phone && shipping.phone !== user.phone) {
            const resp = await fetch(`http://localhost:5069/api/users/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, phone: shipping.phone })
            });
            if (resp.ok) setUser({ ...user, phone: shipping.phone });
        }

        try {
            const isChanged = !lastAddress || 
                shipping.addressLine !== lastAddress.addressLine || 
                shipping.city !== lastAddress.city ||
                shipping.postalCode !== (lastAddress.postalCode || '');

            let targetAddressId = lastAddress?.addressId;

            if (isChanged) {
                const res = await fetch('http://localhost:5069/api/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId, ...shipping })
                });
                const newAddr = await res.json();
                setAddresses(prev => [...prev, newAddr]);
                targetAddressId = newAddr.addressId;
            }

            const res = await fetch('http://localhost:5069/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, addressId: targetAddressId, items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })) })
            });
            if (res.ok) {
                alert("Order placed!");
                setCart({});
                loadUserOrders(currentUserId);
                setActiveTab('orders');
            }
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="screen">
            {view === 'cart' ? (
                <>
                    <h2>Your Cart</h2>
                    {cartItems.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <>
                            {cartItems.map(item => (
                                <div key={item.id} className="menu-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span>{item.name} <strong>x{item.quantity}</strong></span>
                                    <div>
                                        <button className="tab" onClick={() => decrementCart(item.id)}>-</button>
                                        <button className="tab" onClick={() => addToCart(item)}>+</button>
                                    </div>
                                </div>
                            ))}
                            <button className="teal-btn" onClick={() => setView('checkout')}>Proceed to Checkout</button>
                        </>
                    )}
                </>
            ) : (
                <form onSubmit={handlePlaceOrder}>
                    <button type="button" className="tab" onClick={() => setView('cart')}>← Back</button>
                    <h2>Shipping Details</h2>
                    <input className="form-input" placeholder="Address" value={shipping.addressLine} onChange={e => setShipping({...shipping, addressLine: e.target.value})} required />
                    <input className="form-input" placeholder="City" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} required />
                    <input className="form-input" placeholder="Postal" value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} />
                    <input className="form-input" placeholder="Phone" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} required />
                    <button type="submit" className="teal-btn">Confirm Order</button>
                </form>
            )}
        </div>
    );
}
export default CartScreen;