import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Renewable Energy',
    certificate_url: '',
    seller_id: 1 
  });

  // 1. Fetch all products on page mount
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/products', formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        category: 'Renewable Energy',
        certificate_url: '',
        seller_id: 1
      });
      fetchProducts();
      alert('✅ Product added successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle minting on Stellar
  const handleMint = async (product) => {
    if (!window.confirm(`Mint certificate for "${product.name || product.title}" on the Stellar blockchain ledger network?`)) {
      return;
    }
    
    setMinting({ ...minting, [product.id]: true });
    
    try {
      const response = await axios.post('/api/certificates/mint', {
        product_id: product.id
      });
      
      alert(`✅ Certificate minted successfully!\n\nTX Hash: ${response.data.transaction_hash}`);
      fetchProducts(); // Refresh list immediately to reveal verification features
    } catch (error) {
      console.error('Minting error:', error);
      alert('❌ Failed to mint certificate.');
    } finally {
      setMinting({ ...minting, [product.id]: false });
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#2e7d32' }}>Eco Marketplace</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Verify and purchase authenticated sustainable goods on-chain.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add Eco Product
        </button>
      </div>

      {/* Grid Dashboard Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {products.length === 0 ? (
          <p style={{ color: '#999', gridColumn: '1/-1', textAlign: 'center', marginTop: '50px' }}>
            No eco products posted yet. Be the first to list a sustainable asset!
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {product.category}
                </span>
                <h3 style={{ margin: '15px 0 10px 0', color: '#333' }}>{product.name || product.title}</h3>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.4', minHeight: '60px' }}>
                  {product.description || 'No description provided for this asset.'}
                </p>
                
                {product.certificate_url && (
                  <a
                    href={product.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '13px', color: '#1565c0', textDecoration: 'none', display: 'block', marginBottom: '10px' }}
                  >
                    📄 View Original Document Link
                  </a>
                )}
              </div>

              {/* Dynamic Mint Action Button Control */}
              <button
                onClick={() => handleMint(product)}
                disabled={minting[product.id] || !!product.stellar_tx_hash}
                style={{
                  marginTop: '15px',
                  padding: '10px 16px',
                  background: product.stellar_tx_hash ? '#ccc' : minting[product.id] ? '#ff9800' : '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (product.stellar_tx_hash || minting[product.id]) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '100%',
                  opacity: minting[product.id] ? 0.7 : 1
                }}
              >
                {minting[product.id] ? '⏳ Minting...' : product.stellar_tx_hash ? '✅ On-Chain Certificate Minted' : '🔨 Mint Eco Certificate'}
              </button>

              {/* 🔍 PUBLIC LEDGER VERIFICATION ROUTE INTERACTOR */}
              {product.stellar_tx_hash && (
                <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px dashed #eee' }}>
                  <div style={{ wordBreak: 'break-all', fontSize: '11px', color: '#555', marginBottom: '8px' }}>
                    <strong>Stellar TX Hash:</strong> <span style={{ fontFamily: 'monospace', color: '#333' }}>{product.stellar_tx_hash}</span>
                  </div>
                  
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${product.stellar_tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '1px solid #bbdefb',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#bbdefb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                  >
                    🔍 Verify Live on Blockchain Explorer 🌐
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Product Listing Modal Code */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '450px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>List New Eco Asset</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Product Title Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Solar Panel, Carbon Units etc..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Category Scope</label>
                <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="Renewable Energy">Renewable Energy</option>
                  <option value="Carbon Offset Asset">Carbon Offset Asset</option>
                  <option value="Recycled Material">Recycled Material</option>
                  <option value="Energy Efficient Device">Energy Efficient Device</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Product attributes..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', height: '60px', resize: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Certificate URL</label>
                <input type="url" name="certificate_url" value={formData.certificate_url} onChange={handleInputChange} placeholder="https://example.org/cert/123" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: loading ? '#ccc' : '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Publishing...' : 'Publish Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;