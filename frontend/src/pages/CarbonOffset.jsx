import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Initialize Stripe Client with a dummy test key placeholder
const stripePromise = loadStripe('pk_test_51PlaceholderKeyHere');

function CarbonOffset() {
  const [amount, setAmount] = useState(10);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState('stripe');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // 🎯 Pattern A: Clean relative pathing passing securely through your proxy matrix
      const response = await axios.get('/api/offset/user/1');
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching impact parameters:', error);
    }
  };

  const handleSimulatedStripePayment = async (e) => {
    e.preventDefault();
    if (amount < 1) {
      alert('Minimum tracking threshold is $1.');
      return;
    }
    setLoading(true);
    try {
      // 1. Post to your updated relative endpoint
      const createResponse = await axios.post('/api/offset/buy-stripe', {
        user_id: 1,
        amount_usd: amount,
        email: 'founder@ecochain.io',
        name: 'Hritika Das'
      });

      const { payment_intent_id } = createResponse.data;

      // 2. Intentional micro-delay to simulate secure banking gateway handshakes
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Complete structural data logging loop with backend configuration
      const confirmResponse = await axios.post('/api/offset/confirm-stripe', {
        user_id: 1,
        payment_intent_id: payment_intent_id,
        amount_usd: amount
      });

      setResult(confirmResponse.data);
      alert('💳 Payment Verified! Relational schemas synchronized inside ecochain.db');
      setAmount(10);
      await fetchHistory();
    } catch (error) {
      console.error('Gateway processing fault:', error);
      alert(`❌ Transaction Declined: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalTrees = history.reduce((sum, h) => sum + h.trees_planted, 0);
  const totalSpent = history.reduce((sum, h) => sum + h.amount_usd, 0);

  const chartData = history.length > 0 ? {
    labels: ['Processed Offsets', 'Remaining Goal Space'],
    datasets: [{
      data: [totalTrees, Math.max(10, 100 - totalTrees)],
      backgroundColor: ['#10b981', '#f1f5f9'],
      borderColor: ['#059669', '#e2e8f0'],
      borderWidth: 1
    }]
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* HEADER ROW */}
      <div className="mb-10 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <h1 className="text-3xl font-black tracking-tight mb-2">🌳 Carbon Offset Marketplace</h1>
        <p className="text-slate-400 text-xs max-w-2xl">
          Deploy capital assets towards carbon credit liquidation. Transactions undergo cryptographic verification loops connected directly to persistent relational server schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INTERACTION COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROVIDER SELECTOR */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Select Active Settlement Gateway</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveProvider('stripe')}
                className={`p-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${activeProvider === 'stripe' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-inner' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                💳 Stripe Merchant Gateway
              </button>
              <button 
                disabled
                className="p-4 rounded-xl font-bold text-sm border bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50 flex items-center justify-center gap-1"
              >
                🔒 Stellar Ledger (In Build)
              </button>
            </div>
          </div>

          {/* SIMULATED GATEWAY WARNING PANEL */}
          <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl flex items-start gap-3">
            <span className="text-xl">🧪</span>
            <div>
              <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Developer Sandbox Active</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Running behind standard Merchant Test Profiles. Gateway accepts automated token requests matching structural mock metrics natively.
              </p>
            </div>
          </div>

          {/* LIQUIDATION FORM */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold tracking-tight mb-2">Capital Injection Parameters</h3>
            <p className="text-slate-500 text-xs mb-6">Each $1 USD allocation systematically sponsors the deployment of 0.5 physical flora units.</p>
            
            <form onSubmit={handleSimulatedStripePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contribution Magnitude (USD)</label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                  <span className="px-4 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl">$</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 max-w-md">
                <div className="flex justify-between">
                  <span className="text-slate-500">Flora Units Planted:</span>
                  <strong className="text-emerald-700">{Math.floor(amount * 0.5)} Trees</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Network Fee:</span>
                  <strong className="text-slate-600">2.9% + $0.30</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-md py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Executing Secure Gateway Connection...' : `Authorize Stripe Settlement ($${amount}.00)`}
              </button>
            </form>

            {/* RESULTS RENDERING DISPLAY */}
            {result && (
              <div className="mt-6 p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn">
                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">✅ API Operational Sync Complete</h4>
                <p className="text-xs text-slate-600">Sponsoring Allocation payload bound successfully to isolated entry row.</p>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-emerald-100 text-slate-500 break-all mt-2">
                  LEDGER_REF_ID: {result.payment_intent_id || `stripe_mock_intent_${Date.now()}`}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* METRICS & METADATA COLUMN */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold tracking-tight mb-4 border-b border-slate-100 pb-2">Your Ecological Impact</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aggregate Trees</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{totalTrees}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capital Invested</div>
                <div className="text-2xl font-black text-blue-600 mt-1">${totalSpent}</div>
              </div>
            </div>

            {chartData && (
             <div className="max-w-50 mx-auto mb-4">
                <Pie data={chartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
            )}
          </div>

          {/* HISTORICAL REGISTRY SUMMARY LIST */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold tracking-tight text-slate-700 uppercase mb-3">Recent Offset Index</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No structural logs found inside database.</p>
            ) : (
              <div className="space-y-3 max-h-62.5 overflow-y-auto pr-1">
                {history.slice(0, 5).map((log, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">${log.amount_usd} Real Assets</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md font-mono text-[10px] font-bold">
                      +{log.trees_planted} Units
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CarbonOffset;