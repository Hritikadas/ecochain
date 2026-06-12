import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CarbonOffset() {
  const [amount, setAmount] = useState(10);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/offset/user/1');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleBuy = async () => {
    if (amount < 1) {
      alert('Minimum amount is $1');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/offset/buy', {
        user_id: 1, // Mock user ID for demo purposes
        amount_usd: amount
      });

      setResult(response.data);
      fetchHistory();
      alert('✅ Carbon credits purchased successfully!');
    } catch (error) {
      console.error('Error buying offset:', error);
      alert('Failed to purchase carbon credits. Make sure your backend offset route is implemented.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data configuration mapping for historical milestones
  const chartData = history.length > 0 ? {
    labels: history.map((h, i) => `Offset Batch ${i + 1}`),
    datasets: [{
      label: 'Trees Planted',
      data: history.map(h => h.trees_planted),
      backgroundColor: ['#4caf50', '#2e7d32', '#81c784', '#66bb6a', '#a5d6a7']
    }]
  } : null;

  const totalTrees = history.reduce((sum, h) => sum + h.trees_planted, 0);
  const totalSpent = history.reduce((sum, h) => sum + h.amount_usd, 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>🌳 Carbon Offset Marketplace</h1>
      <p style={{ margin: '0 0 30px 0', color: '#64748b' }}>Mitigate your carbon footprint by funding transparent reforestation initiatives tracked on-chain.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Buy Carbon Credits Column */}
        <div style={{ padding: '25px', background: '#e8f5e9', borderRadius: '12px', border: '1px solid #c8e6c9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, color: '#1b5e20' }}>🌱 Buy Carbon Credits</h3>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
            Each $1 plants 0.5 trees. Your contribution directly funds transparent, verified global carbon sinks.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Investment Amount (USD):</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="1"
                step="1"
                style={{ 
                  width: '140px', 
                  padding: '10px', 
                  fontSize: '16px',
                  border: '2px solid #2e7d32',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              <span style={{ padding: '10px 18px', background: '#2e7d32', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}>
                USD ($)
              </span>
            </div>
          </div>

          {/* Real-time Environmental Metric Impact Previews */}
          <div style={{ padding: '15px', background: 'white', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#334155' }}>
              💚 You'll plant: <strong style={{ color: '#2e7d32' }}>{Math.floor(amount * 0.5)} trees</strong>
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#334155' }}>
              🌍 CO2 offset equivalent: <strong style={{ color: '#2e7d32' }}>{(amount * 0.1).toFixed(1)} tons</strong>
            </p>
          </div>

          <button 
            onClick={handleBuy}
            disabled={loading}
            style={{ 
              padding: '14px 24px', 
              background: loading ? '#cbd5e1' : '#2e7d32', 
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              boxShadow: '0 4px 6px rgba(46, 125, 50, 0.15)',
              transition: 'background 0.2s'
            }}
          >
            {loading ? '🔄 Processing Blockchain Settlement...' : '🌳 Retire Credits via Stellar'}
          </button>

          {/* Automated On-Chain Settlement Success Message Box */}
          {result && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#c8e6c9', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Settlement Successful!</h4>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                Your retirement allocation of <strong>${result.amount_usd}</strong> successfully planted <strong>{result.trees_planted} trees</strong>.
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                🔗 <strong>Stellar Ledger Hash:</strong> <code style={{ background: 'rgba(255,255,255,0.6)', padding: '2px 5px', borderRadius: '3px' }}>{result.transaction_hash}</code>
              </p>
            </div>
          )}
        </div>

        {/* User's Historical Offset Analysis Column */}
        <div style={{ padding: '25px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>📊 Your Cumulative Impact</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', textAlign: 'center', border: '1px solid #c8e6c9' }}>
              <p style={{ margin: '0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Total Trees Funded</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#2e7d32', fontWeight: 'bold' }}>{totalTrees}</p>
            </div>
            <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbdefb' }}>
              <p style={{ margin: '0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Total Retires (USD)</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#1976d2', fontWeight: 'bold' }}>${totalSpent}</p>
            </div>
          </div>

          {/* Interactive Chart.js Framework Injection Layer */}
          {chartData ? (
            <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', width: '100%', textAlign: 'left' }}>Trees Planted Breakdown Per Batch</h4>
              <div style={{ width: '220px', height: '220px' }}>
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          ) : null}

          {/* History Transactions Feed Index Layer */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Recent Credit Retirement Receipts</h4>
          {history.length > 0 ? (
            <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
              {history.slice(0, 5).map((offset, index) => (
                <div key={index} style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span style={{ color: '#2e7d32' }}>💚 Retires: ${offset.amount_usd}</span>
                    <span style={{ color: '#475569' }}>🌳 {offset.trees_planted} Trees</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Stamped on: {new Date(offset.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '30px' }}>
              No credits retired yet. Complete an asset purchase to generate history.
            </p>
          )}
        </div>
      </div>

      {/* 🟩 FIXED: Consolidated border style definition cleanly inside quotes string */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#fff3e0', borderRadius: '12px', border: '1px solid #ff9800' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#e65100', display: 'flex', alignItems: 'center', gap: '8px' }}>🌐 Cryptographic Carbon Verification Engine</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8', color: '#475569', fontSize: '14px' }}>
          <li>All credit assets purchases undergo automated programmatic mint transactions settled over the <strong>Stellar Blockchain</strong> framework layer.</li>
          <li>Capital value allocations route directly toward audit-verified international tree plantations networks.</li>
          <li>On-chain parameters record cryptographic receipts immutably to prevent duplicate corporate credit counting (double-spending greenwashing attacks).</li>
        </ul>
      </div>
    </div>
  );
}

export default CarbonOffset;