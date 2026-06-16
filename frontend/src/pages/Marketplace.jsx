import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🎯 ENVIRONMENT AXIOS PATH CONFIGURATION MATRIX
const API_BASE = import.meta.env.VITE_API_URL || '';

const Marketplace = () => {
  // 🔐 DYNAMIC USER SESSION CONTEXT (No longer hardcoded!)
  const activeSessionUser = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Hritika Das' };

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState({});
  
  // React State Hooks are properly configured at the top level
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Renewable Energy',
    certificate_url: '',
    price: '', // Kept empty to ensure the user inputs an explicit value
    seller_id: activeSessionUser.id 
  });

  // 1. Fetch all products on page mount
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('🚨 Error reading asset catalog stream:', error);
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
      // Send data dynamically including the real runtime active session attributes
      await axios.post(`${API_BASE}/api/products`, {
        ...formData,
        seller_name: activeSessionUser.name // Attaching name from session payload dynamically
      });
      
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        category: 'Renewable Energy',
        certificate_url: '',
        price: '',
        seller_id: activeSessionUser.id
      });
      await fetchProducts();
      alert('✅ Asset successfully written to live production database!');
    } catch (error) {
      console.error('🚨 Failed to execute asset creation endpoint:', error);
      alert(`❌ Failed to add product: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle minting on Stellar Ledger
  const handleMint = async (product) => {
    if (!window.confirm(`Mint cryptographic sustainability tracking certificate for "${product.name || product.title}" on the Stellar Testnet ledger?`)) {
      return;
    }
    
    setMinting((prev) => ({ ...prev, [product.id]: true }));
    
    try {
      const response = await axios.post(`${API_BASE}/api/certificates/mint`, {
        product_id: product.id
      });
      
      alert(`✅ Cryptographic Mint Successful!\n\nStellar TX Hash:\n${response.data.transaction_hash || response.data.stellar_tx_hash}`);
      await fetchProducts();
    } catch (error) {
      console.error('🚨 Minting pipeline failure:', error);
      alert('❌ Cryptographic mint rejected by blockchain gateway protocol.');
    } finally {
      setMinting((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* MODULE HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            🌱 Eco Marketplace
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Verify provenance and trade authenticated green assets via immutable decentralized metadata hooks.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex justify-center items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          + Add Eco Product
        </button>
      </div>

      {/* DASHBOARD CARD CONTAINER MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <span className="text-3xl block mb-2">📦</span>
            <p className="text-slate-400 font-semibold text-sm">No eco assets currently registered inside cloud matrix logs.</p>
            <p className="text-slate-400 text-xs mt-1">Initialize the marketplace loop by clicking the registration portal button above.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-4 mb-2">
                  {product.name || product.title}
                </h3>
                {product.price && (
                  <p className="text-slate-900 font-extrabold text-sm mb-2">${product.price}</p>
                )}
                <p className="text-slate-500 text-xs leading-relaxed mb-4 min-h-12">
                  {product.description || 'No alternative meta parameters supplied for this specific catalog entry.'}
                </p>
                
                {product.certificate_url && (
                  <a
                    href={product.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline mb-4"
                  >
                    📄 Reference Verification Document →
                  </a>
                )}
              </div>

              {/* ACTION EXECUTION MODULES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleMint(product)}
                  disabled={minting[product.id] || !!product.stellar_tx_hash}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl text-white transition-all cursor-pointer ${
                    product.stellar_tx_hash 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                      : minting[product.id] 
                        ? 'bg-amber-500 animate-pulse cursor-wait' 
                        : 'bg-slate-900 hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {minting[product.id] ? '⏳ Synchronizing Blocks...' : product.stellar_tx_hash ? '✅ Provenance Verified on Stellar' : '🔨 Mint Asset Audit Proof'}
                </button>

                {/* REAL-TIME DECENTRALIZED EXPLORER DRAWERS */}
                {product.stellar_tx_hash && (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      <span className="font-bold text-slate-700 uppercase block tracking-wider text-[9px] mb-0.5">Stellar Network Ledger Anchor</span>
                      <code className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded block mt-1 break-all select-all">{product.stellar_tx_hash}</code>
                    </div>
                    
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${product.stellar_tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex justify-center items-center text-center py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition-colors hover:bg-blue-100"
                    >
                      🔍 Open Stellar Explorer Window
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ASSET CREATION CONTAINER INTERFACE SHEET */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative mx-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">List New Eco Asset</h2>
            <p className="text-slate-400 text-xs mb-6">Append a structural asset unit into the decentralized indexing layers.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Asset Inventory Identifier</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., Solar Module 450W, Tier-1 Carbon Credit" 
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Classification Context</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                >
                  <option value="Renewable Energy">Renewable Energy</option>
                  <option value="Carbon Offset Asset">Carbon Offset Asset</option>
                  <option value="Recycled Material">Recycled Material</option>
                  <option value="Energy Efficient Device">Energy Efficient Device</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Asset Price (USD)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g., 49.99" 
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Technical Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter structural metrics, verification provenance, and serial identifiers..." 
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm h-20 resize-none focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Audit Documentation URL</label>
                <input 
                  type="url" 
                  name="certificate_url" 
                  value={formData.certificate_url} 
                  onChange={handleInputChange} 
                  placeholder="https://identity-vault.org/proof/cert.pdf" 
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Publishing Matrix...' : 'Publish Asset'}
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