import { useState, useEffect } from 'react';

function ProfileScreen({ user, setUser, addresses, setAddresses, onLogout }) {
  const [view, setView] = useState('main');
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', newPassword: '' });
  const [addressForm, setAddressForm] = useState({ addressLine: '', city: '', postalCode: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const currentUserId = user?.userId || user?.id;

  const loadUserData = async () => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`http://localhost:5069/api/users/${currentUserId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser((prev) => ({ ...prev, ...userData }));
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          newPassword: ''
        });
      }
    } catch (err) { console.error("Error loading user data:", err); }
  };

  useEffect(() => { loadUserData(); }, [currentUserId]);

  const handleAccountSave = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5069/api/users/${currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        newPassword: profileData.newPassword || null
      })
    });
    const updatedUser = await response.json();
    if (response.ok) {
      setUser({ ...user, ...updatedUser });
      setView('main');
    }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingAddressId;
    const response = await fetch(isEdit ? `http://localhost:5069/api/addresses/${editingAddressId}` : 'http://localhost:5069/api/addresses', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? addressForm : { userId: currentUserId, ...addressForm })
    });
    const savedAddress = await response.json();
    setAddresses(isEdit ? addresses.map(a => a.addressId === editingAddressId ? savedAddress : a) : [...addresses, savedAddress]);
    setView('address-list');
  };

  const handleDeleteAddress = async (id) => {
    await fetch(`http://localhost:5069/api/addresses/${id}`, { method: 'DELETE' });
    setAddresses(addresses.filter(a => a.addressId !== id));
  };

  return (
    <div className="screen">
      {view === 'main' && (
        <>
          <h2>My Profile</h2>
          <div className="card" style={{ padding: '16px' }}>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || 'None provided'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <button className="teal-btn" onClick={() => setView('edit-profile')}>Edit Account Info</button>
            <button className="teal-btn" onClick={() => setView('address-list')}>Manage Address Book</button>
            <button className="teal-btn" style={{ background: '#ef4444' }} onClick={onLogout}>Log Out</button>
          </div>
        </>
      )}

      {view === 'edit-profile' && (
        <form onSubmit={handleAccountSave}>
          <button type="button" className="tab" onClick={() => setView('main')}>← Cancel</button>
          <h2>Edit Account Details</h2>
          <input className="form-input" placeholder="Full Name" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required />
          <input className="form-input" placeholder="Email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} required />
          <input className="form-input" placeholder="Phone Number" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
          <input type="password" className="form-input" placeholder="New Password" value={profileData.newPassword} onChange={e => setProfileData({...profileData, newPassword: e.target.value})} />
          <button type="submit" className="teal-btn">Save Changes</button>
        </form>
      )}

      {view === 'address-list' && (
        <>
          <button className="tab" onClick={() => setView('main')}>← Back to Profile</button>
          <h2>Saved Shipping Addresses</h2>
          {addresses.map(a => (
            <div key={a.addressId} className="menu-item" style={{ padding: '10px' }}>
              {a.addressLine}, {a.city}
              <button className="tab" onClick={() => { setAddressForm(a); setEditingAddressId(a.addressId); setView('address-form'); }}>Edit</button>
              <button className="tab" onClick={() => handleDeleteAddress(a.addressId)}>Delete</button>
            </div>
          ))}
          <button className="teal-btn" onClick={() => { setEditingAddressId(null); setView('address-form'); }}>+ Add New Address</button>
        </>
      )}

      {view === 'address-form' && (
        <form onSubmit={handleAddressSave}>
          <button type="button" className="tab" onClick={() => setView('address-list')}>← Cancel</button>
          <h2>{editingAddressId ? 'Edit Address' : 'Add Address'}</h2>
          <input className="form-input" placeholder="Address" value={addressForm.addressLine} onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})} required />
          <input className="form-input" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
          <button type="submit" className="teal-btn">Save Address</button>
        </form>
      )}
    </div>
  );
}
export default ProfileScreen;