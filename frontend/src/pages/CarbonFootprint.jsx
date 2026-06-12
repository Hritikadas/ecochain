import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CarbonFootprint() {
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
      const response = await axios.get('/api/footprint/user/1');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
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
      // Connect to the backend route we just updated
      const response = await axios.post('/api/footprint/calculate', {
        user_id: 1, // hardcoded temporary demo ID
        commute_km: formData.commute_km,
        commute_mode: formData.commute_mode,
        diet_type: formData.diet_type,
        electricity_kwh: formData.electricity_kwh
      });

      setResult(response.data);
      fetchHistory(); // Refresh history
      alert('✅ Carbon footprint calculated successfully!');
    } catch (err) {
      console.error('Error calculating footprint:', err);
      setError('Failed to connect to the backend server. Make sure it is running!');
    } finally {
      setLoading(false);
    }
  };

  // Hardcoded coefficients for rendering the breakdown charts locally
  const factors = { car: 0.17, bus: 0.09, metro: 0.05, bike: 0, walk: 0 };
  const dietFactors = { meat: 1.5, vegetarian: 1.0, vegan: 0.8 };

  const chartData = result ? {
    labels: ['Commute', 'Diet', 'Electricity'],
    datasets: [{
      label: 'CO2 (tons/year)',
      data: [
        (formData.commute_km * factors[formData.commute_mode]) / 1000,
        (dietFactors[formData.diet_type] * 365) / 1000,
        (formData.electricity_kwh * 0.5) / 1000
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3']
    }]
  } : null;

  return (
    <div>
      <h1>🌱 AI Carbon Footprint Tracker</h1>
      
      {error && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Commute Distance (km/day):</label>
          <input
            type="number"
            name="commute_km"
            value={formData.commute_km}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Commute Mode:</label>
          <select
            name="commute_mode"
            value={formData.commute_mode}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="car">Car</option>
            <option value="bus">Bus</option>
            <option value="metro">Metro</option>
            <option value="bike">Bike</option>
            <option value="walk">Walk</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Diet Type:</label>
          <select
            name="diet_type"
            value={formData.diet_type}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="meat">Meat</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Electricity (kWh/month):</label>
          <input
            type="number"
            name="electricity_kwh"
            value={formData.electricity_kwh}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: loading ? '#ccc' : '#2e7d32', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Calculating...' : 'Calculate Footprint'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
          <h2>Your Carbon Footprint</h2>
          <p style={{ fontSize: '24px', color: '#2e7d32', fontWeight: 'bold' }}>
            {result.total_co2_tons.toFixed(2)} tons CO2/year
          </p>
          <p><strong>Suggestions:</strong> {result.suggestions}</p>
          
          {chartData && (
            <div style={{ marginTop: '20px' }}>
              <Bar data={chartData} options={{ responsive: true }} />
            </div>
          )}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>📜 Calculation History</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {history.map((log, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {log.activity_type}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    {new Date(log.logged_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  Emissions: <strong>{(log.emissions_kg / 1000).toFixed(2)} tons CO2</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarbonFootprint;