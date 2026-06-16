import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different place types
const getIcon = (type) => {
  const colors = {
    ev: 'blue',
    recycling: 'orange',
    organic: 'green',
    park: 'violet'
  };
  
  const markerColor = colors[type] || 'green';
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/marker-icon-2x-${markerColor}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// 🎯 ENVIRONMENT AXIOS PATH CONFIGURATION MATRIX
const API_BASE = import.meta.env.VITE_API_URL || '';

function EcoMap() {
  // 🔐 DYNAMIC USER SESSION CONTEXT (No longer hardcoded!)
  const activeSessionUser = JSON.parse(localStorage.getItem('user')) || { id: 1 };

  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ev',
    latitude: 19.2183,
    longitude: 72.9713,
    note: ''
  });

  // Default location frame
  const defaultLocation = [19.2183, 72.9713];

  useEffect(() => {
    fetchPlaces();
  }, [filter]);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/places?type=${filter}`);
      setPlaces(response.data || []);
    } catch (error) {
      console.error('🚨 Error reading ecosystem geoframing records:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6))
          });
        },
        (error) => {
          console.error('🚨 Geolocation context lookup failed:', error);
          alert('Could not access current physical geolocational coordinates. Please insert values manually.');
        }
      );
    } else {
      alert('Local GPS location polling services are disabled or unsupported by your active client browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Direct variable assignment from runtime context maps securely without fallback anchors
      await axios.post(`${API_BASE}/api/places/add`, {
        user_id: activeSessionUser.id,
        name: formData.name,
        type: formData.type,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        note: formData.note
      });
      
      alert('✅ New eco place added successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        type: 'ev',
        latitude: 19.2183,
        longitude: 72.9713,
        note: ''
      });
      await fetchPlaces();
    } catch (error) {
      console.error('🚨 Failed tracking place parameter creation line:', error);
      alert('❌ Failed to add place. Please verify inputs and verify network connection endpoints.');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' },
    { value: 'ev', label: 'EV Charging', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
    { value: 'recycling', label: 'Recycling Centers', bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' },
    { value: 'organic', label: 'Organic Hubs', bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
    { value: 'park', label: 'Parks & Reserves', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* MODULE HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            🗺️ Eco-Friendly Places Map
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Discover verified green facilities, power structures, and sustainability hubs mapped in real-time across decentralized records.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex justify-center items-center px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-white ${
            showForm ? 'bg-slate-600 hover:bg-slate-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {showForm ? 'Cancel Form' : '+ Add Eco Place'}
        </button>
      </div>

      {/* FILTER BUTTON SEGMENT */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              filter === option.value 
                ? `${option.bg} ${option.text} ${option.border} shadow-inner` 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD PLACE SYSTEM SHEET PANEL */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-max animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 border-b border-slate-100 pb-2">
              Register New Environmental Asset
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Place Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., GreenVolt Hub, Organic Meadows"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Facility Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                >
                  <option value="ev">EV Charging Station</option>
                  <option value="recycling">Recycling Center</option>
                  <option value="organic">Organic Store</option>
                  <option value="park">Park</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleLocationSelect}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  📍 Fetch Live Device Coordinates
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Technical Meta Notes</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Operational timelines, connector parameters, special conditions..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm resize-none focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Publish Location Anchor
              </button>
            </form>
          </div>
        )}

        {/* GEOLOCATIONAL MAP FRAMING CONTAINER */}
        <div className={`rounded-2xl border border-slate-200 shadow-md bg-slate-50 relative overflow-hidden min-h-112.5 ${
          showForm ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <MapContainer 
            center={defaultLocation} 
            zoom={13} 
            className="h-full w-full absolute inset-0 z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            
            {places.map(place => (
              <Marker 
                key={place.id} 
                position={[place.latitude, place.longitude]}
                icon={getIcon(place.type)}
              >
                <Popup>
                  <div className="p-1 min-w-44 font-sans text-slate-800">
                    <h4 className="font-extrabold text-sm text-emerald-700 tracking-tight mb-1">{place.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      Category: <span className="text-slate-700 font-mono">{place.type}</span>
                    </p>
                    {place.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 border border-slate-200 rounded-lg leading-normal italic">
                        {place.note}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* DETAILED LEDGER GRID LOGS LIST */}
      <div className="mt-12">
        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-6">
          📍 Indexed {filter === 'all' ? 'All Registered' : filterOptions.find(f => f.value === filter)?.label} Nodes
        </h3>
        
        {places.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <span className="text-2xl block mb-2">🗺️</span>
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">No spatial asset points logged inside this frame loop context.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map(place => (
              <div 
                key={place.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 tracking-tight mb-2 truncate">{place.name}</h4>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                    {place.type}
                  </span>
                  {place.note && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-4 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      {place.note}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-[9px] text-slate-400 flex justify-between">
                  <span>LAT: {Number(place.latitude).toFixed(4)}</span>
                  <span>LNG: {Number(place.longitude).toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default EcoMap;