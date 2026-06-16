import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🎯 ENVIRONMENT AXIOS PATH CONFIGURATION MATRIX
const API_BASE = import.meta.env.VITE_API_URL || '';

function CarbonFootprint() {
  // 🔐 DYNAMIC USER SESSION CONTEXT (No longer hardcoded!)
  const activeSessionUser = JSON.parse(localStorage.getItem('user')) || { id: 1 };

  const [formData, setFormData] = useState({
    commute_km: 0,
    commute_mode: 'car',
    diet_type: 'vegetarian',
    electricity_kwh: 0
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/footprint/user/${activeSessionUser.id}`);
      setHistory(response.data || []);
    } catch (error) {
      console.error('🚨 Error fetching historical emission streams:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sending payload dynamically anchored directly to runtime session properties
      const response = await axios.post(`${API_BASE}/api/footprint/calculate`, {
        user_id: activeSessionUser.id, 
        commute_km: parseFloat(formData.commute_km) || 0,
        commute_mode: formData.commute_mode,
        diet_type: formData.diet_type,
        electricity_kwh: parseFloat(formData.electricity_kwh) || 0
      });

      setResult(response.data);
      await fetchHistory(); // Instantly refresh table ledger states
      alert('✅ Carbon footprint calculated successfully!');
    } catch (err) {
      console.error('🚨 Calculation routing breakdown:', err);
      setError('Failed to establish a live pipeline bridge to the production backend engine layer.');
    } finally {
      setLoading(false);
    }
  };

  // Hardcoded coefficients for rendering the breakdown charts locally
  const factors = { car: 0.17, bus: 0.09, metro: 0.05, bike: 0, walk: 0 };
  const dietFactors = { meat: 1.5, vegetarian: 1.0, vegan: 0.8 };

  const chartData = result ? {
    labels: ['Commute Impact', 'Diet Profile', 'Grid Electricity'],
    datasets: [{
      label: 'CO2 Footprint Metric (Tons / Year)',
      data: [
        (formData.commute_km * factors[formData.commute_mode] * 365) / 1000,
        (dietFactors[formData.diet_type] * 365) / 1000,
        (formData.electricity_kwh * 12 * 0.5) / 1000
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      borderRadius: 8
    }]
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* MODULE HEADER BAR */}
      <div className="mb-10 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <h1 className="text-3xl font-black tracking-tight mb-2">🌱 AI Carbon Footprint Tracker</h1>
        <p className="text-slate-400 text-xs max-w-2xl">
          Analyze real-time localized energy profiles and transportation vectors through analytical backend models to catalog ecological expenditure.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl shadow-xs">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT FORM SCHEMAS PANEL */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs h-max">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-6 border-b border-slate-100 pb-2">Metrics Input Stream</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Commute Magnitude (KM / Day)</label>
              <input
                type="number"
                name="commute_km"
                value={formData.commute_km}
                onChange={handleChange}
                min="0"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Transportation Modality</label>
              <select
                name="commute_mode"
                value={formData.commute_mode}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              >
                <option value="car">🚗 Single Passenger Car</option>
                <option value="bus">🚌 Public Transit Bus</option>
                <option value="metro">🚇 High-Capacity Metro</option>
                <option value="bike">🚴 Eco Bicycle Units</option>
                <option value="walk">🏃 Pedestrian Walking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dietary Profile Context</label>
              <select
                name="diet_type"
                value={formData.diet_type}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              >
                <option value="meat">🥩 Omnivore (Meat Inclusion)</option>
                <option value="vegetarian">🥗 Plant-Based Vegetarian</option>
                <option value="vegan">🌱 Pure Ecological Vegan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grid Electricity Consumption (kWh / Month)</label>
              <input
                type="number"
                name="electricity_kwh"
                value={formData.electricity_kwh}
                onChange={handleChange}
                min="0"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Parsing Engine Queries...' : 'Calculate Footprint Metrics'}
            </button>
          </form>
        </div>

        {/* COMPILATION RESULTS DISPLAYS */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="bg-emerald-50/40 border border-emerald-200 p-6 md:p-8 rounded-2xl shadow-2xs animate-fadeIn">
              <h2 className="text-lg font-bold text-emerald-950 tracking-tight mb-1">Your Aggregated Footprint</h2>
              <p className="text-slate-400 text-xs mb-4">Calculations compiled from localized analytical system metrics models.</p>
              
              <div className="text-3xl font-black text-emerald-600 tracking-tight mb-4 bg-white px-4 py-3 rounded-xl border border-emerald-100 w-max shadow-2xs">
                {Number(result.total_co2_tons).toFixed(2)} <span className="text-sm font-bold text-slate-500">Tons CO₂ / Year</span>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-emerald-100 text-xs leading-relaxed text-slate-600 shadow-2xs">
                <strong className="text-emerald-900 block font-bold mb-1 uppercase tracking-wider text-[10px]">AI Strategic Mitigation Strategy:</strong>
                {result.suggestions || 'Optimize input vectors further to generate strategic carbon lifecycle suggestions.'}
              </div>
              
              {chartData && (
                <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <span className="text-3xl block mb-2">📊</span>
              <p className="text-slate-400 font-semibold text-sm">No environmental matrix evaluations analyzed yet.</p>
              <p className="text-slate-400 text-xs mt-1">Submit configuration parameters inside the input interface sheet to project metrics maps.</p>
            </div>
          )}

          {/* HISTORICAL LEDGER ENTRIES LIST */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">📜 Historical Calculation Registry</h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {history.map((log, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                    <div>
                      <div className="font-extrabold text-slate-900 capitalize text-sm tracking-tight">{String(log.activity_type).replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(log.logged_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md font-mono text-[10px] font-bold">
                        {(log.emissions_kg / 1000).toFixed(2)} Tons CO₂
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CarbonFootprint;