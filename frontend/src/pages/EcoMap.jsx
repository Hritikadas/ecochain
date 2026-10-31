import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../config/api';

// =========================================================================
// CUSTOM CRISP SVG / DIV MARKER ICONS (No CDN dependencies, zero 404 risk)
// =========================================================================
const getCategoryConfig = (type) => {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('ev') || normalized.includes('charg')) {
    return { emoji: '⚡', color: '#2563eb', bgClass: 'bg-blue-600', borderClass: 'border-blue-700', label: 'EV Charging' };
  }
  if (normalized.includes('recyc') || normalized.includes('waste')) {
    return { emoji: '♻️', color: '#d97706', bgClass: 'bg-amber-600', borderClass: 'border-amber-700', label: 'Recycling Hub' };
  }
  if (normalized.includes('organ') || normalized.includes('store') || normalized.includes('food')) {
    return { emoji: '🌱', color: '#059669', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-700', label: 'Organic & Bulk' };
  }
  if (normalized.includes('park') || normalized.includes('forest') || normalized.includes('reserve')) {
    return { emoji: '🌳', color: '#7c3aed', bgClass: 'bg-violet-600', borderClass: 'border-violet-700', label: 'Parks & Reserves' };
  }
  return { emoji: '📍', color: '#0d9488', bgClass: 'bg-teal-600', borderClass: 'border-teal-700', label: 'Eco Asset' };
};

const createMarkerIcon = (type, isSelected = false) => {
  const cfg = getCategoryConfig(type);
  const size = isSelected ? 40 : 34;

  return L.divIcon({
    className: 'eco-div-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          background-color: white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.22);
          border: 3px solid ${isSelected ? '#10b981' : cfg.color};
          font-size: ${isSelected ? '18px' : '15px'};
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        ">
          ${cfg.emoji}
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${isSelected ? '#10b981' : cfg.color};
        "></div>
      </div>
    `,
    iconSize: [size, size + 6],
    iconAnchor: [0, 0],
    popupAnchor: [0, -(size + 10)]
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background-color: #2563eb;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.35);
      transform: translate(-50%, -50%);
    ">
      <div style="width: 6px; height: 6px; border-radius: 9999px; background: white;"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [0, 0]
});

// =========================================================================
// MAP CONTROLLER (Handles smooth panning, selection, and map click capture)
// =========================================================================
function MapController({ selectedPlace, userLocation, onMapClick, showForm }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedPlace, map]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.0
      });
    }
  }, [userLocation, map]);

  useMapEvents({
    click(e) {
      if (showForm && onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });

  return null;
}

// =========================================================================
// MAIN ECO-MAP MODULE
// =========================================================================
function EcoMap() {
  const user = JSON.parse(localStorage.getItem('ecochain_user') || localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'ev',
    latitude: 19.2183,
    longitude: 72.9713,
    description: ''
  });

  const defaultCenter = [19.2183, 72.9713]; // EcoChain default region hub

  // Fetch places with category filter
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/places' : `/places?type=${filter}`;
      const { data } = await api.get(url);
      setPlaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('🚨 Error fetching eco-places:', error);
      showToast('error', 'Failed to load eco-places from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [filter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Device Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6))
        };
        setUserLocation(coords);
        setFormData(prev => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lng
        }));
        setLocating(false);
        showToast('success', `📍 Centered on your device location (${coords.lat}, ${coords.lng})`);
      },
      (error) => {
        console.error('🚨 Geolocation error:', error);
        setLocating(false);
        showToast('error', 'Unable to retrieve your location. Please check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Click on map to drop pin when form is open
  const handleMapClick = (latlng) => {
    setFormData(prev => ({
      ...prev,
      latitude: parseFloat(latlng.lat.toFixed(6)),
      longitude: parseFloat(latlng.lng.toFixed(6))
    }));
    showToast('success', `📌 Updated pin coordinates: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Place (Admin -> /places, User -> /places/suggest)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = isAdmin ? '/places' : '/places/suggest';
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        description: formData.description.trim()
      };

      const res = await api.post(endpoint, payload);

      showToast(
        'success',
        isAdmin
          ? '✅ New verified eco place published to the decentralized map!'
          : '🌱 Place submitted successfully! It has been indexed for community review.'
      );

      setShowForm(false);
      setFormData({
        name: '',
        type: 'ev',
        latitude: userLocation?.lat || 19.2183,
        longitude: userLocation?.lng || 72.9713,
        description: ''
      });

      await fetchPlaces();
    } catch (error) {
      console.error('🚨 Failed to register place:', error);
      const msg = error.response?.data?.error || 'Failed to save location. Please verify inputs.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter options with category badge counts
  const categoryCounts = places.reduce((acc, p) => {
    const t = (p.type || '').toLowerCase();
    if (t.includes('ev')) acc.ev = (acc.ev || 0) + 1;
    else if (t.includes('recyc')) acc.recycling = (acc.recycling || 0) + 1;
    else if (t.includes('organ')) acc.organic = (acc.organic || 0) + 1;
    else if (t.includes('park')) acc.park = (acc.park || 0) + 1;
    return acc;
  }, {});

  const filterOptions = [
    { value: 'all', label: 'All Hubs', icon: '🌐', count: places.length },
    { value: 'ev', label: 'EV Charging', icon: '⚡', count: categoryCounts.ev || 0 },
    { value: 'recycling', label: 'Recycling Centers', icon: '♻️', count: categoryCounts.recycling || 0 },
    { value: 'organic', label: 'Organic Stores', icon: '🌱', count: categoryCounts.organic || 0 },
    { value: 'park', label: 'Parks & Reserves', icon: '🌳', count: categoryCounts.park || 0 }
  ];

  // Client-side search filtering
  const filteredPlaces = places.filter(place => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (place.name || '').toLowerCase().includes(q);
    const descMatch = (place.description || place.note || '').toLowerCase().includes(q);
    const typeMatch = (place.type || '').toLowerCase().includes(q);
    return nameMatch || descMatch || typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans antialiased text-slate-800">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-3 animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-700' 
            : 'bg-rose-950 text-rose-100 border-rose-700'
        }`}>
          <span>{toast.type === 'success' ? '✨' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* MISSION & PURPOSE HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              <span>🗺️ Decentralized Green Infrastructure Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Eco-Friendly Places & Sustainability Map
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              <strong>The Purpose of EcoMap:</strong> While carbon analyzers measure your footprint and Stellar offsets balance emissions digitally, real sustainability requires <em>physical habit transformation</em>. EcoMap bridges the action gap by guiding you to verified local green infrastructure—eliminating range anxiety with clean EV charging corridors, closing the circular loop with certified e-waste recyclers, supporting chemical-free organic farming, and safeguarding urban carbon sinks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleLocateUser}
              disabled={locating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 cursor-pointer backdrop-blur-md"
            >
              <span>{locating ? '⏳' : '📍'}</span>
              <span>{locating ? 'Locating GPS...' : 'Locate My Position'}</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                showForm 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
              }`}
            >
              <span>{showForm ? '✕' : '+'}</span>
              <span>{showForm ? 'Cancel Pin' : isAdmin ? '+ Add Verified Asset' : '+ Propose Eco Spot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setSelectedPlace(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filter === option.value
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                filter === option.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, charging speed, keyword..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MAP & SUBMISSION PANEL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ADD / PROPOSE PLACE FORM SHEET */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-lg h-max animate-fadeIn lg:col-span-1">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {isAdmin ? '🛡️ Register Verified Asset' : '🌱 Propose Community Spot'}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {isAdmin ? 'Admin Mode • Direct Publish' : 'Community Submission'}
                </span>
              </div>
              <span className="text-xl">📍</span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-normal">
              💡 <em>Tip: You can click anywhere directly on the map to set pin coordinates automatically!</em>
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. GreenVolt Supercharger, BioRefill Co-op"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Facility Classification *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-semibold"
                >
                  <option value="ev">⚡ EV Charging Station (CCS/Type-2)</option>
                  <option value="recycling">♻️ Recycling & E-Waste Facility</option>
                  <option value="organic">🌱 Organic & Zero-Waste Store</option>
                  <option value="park">🌳 Urban Park & Carbon Reserve</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleLocateUser}
                  className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📍</span>
                  <span>Use My Current Device GPS</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Description & Operational Details
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Charging speeds, accepted recyclable materials, operating hours, solar certifications..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs resize-none focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{submitting ? '⏳ Publishing...' : isAdmin ? 'Publish Verified Asset' : 'Submit for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* INTERACTIVE LEAFLET MAP CANVAS */}
        <div className={`rounded-3xl border border-slate-200/80 shadow-md bg-white overflow-hidden relative ${
          showForm ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="h-[520px] w-full relative z-10">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController 
                selectedPlace={selectedPlace} 
                userLocation={userLocation} 
                onMapClick={handleMapClick}
                showForm={showForm}
              />

              {/* User Location Pulse Marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <strong className="text-blue-600 block">📍 Your Live Position</strong>
                      <span>You are browsing nearby sustainable hubs from here.</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Eco Locations Markers */}
              {filteredPlaces.map(place => {
                const isSelected = selectedPlace?.id === place.id;
                const cfg = getCategoryConfig(place.type);

                return (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={createMarkerIcon(place.type, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedPlace(place)
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[220px] font-sans text-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white ${cfg.bgClass}`}>
                            <span>{cfg.emoji}</span>
                            <span>{cfg.label}</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {place.status || 'Verified Active'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight mb-1">
                          {place.name}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {place.description || place.note || 'Sustainable hub open for public access and carbon reduction.'}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            {Number(place.latitude).toFixed(3)}, {Number(place.longitude).toFixed(3)}
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            <span>🧭 Directions</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* MAP BOTTOM STATUS BAR */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Nodes: {filteredPlaces.length} indexed</span>
              </span>
              {selectedPlace && (
                <span className="text-slate-400 font-medium truncate max-w-xs">
                  • Focus: <strong className="text-slate-700">{selectedPlace.name}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">⚡ EV</span>
              <span className="flex items-center gap-1">♻️ Recycling</span>
              <span className="flex items-center gap-1">🌱 Organic</span>
              <span className="flex items-center gap-1">🌳 Reserve</span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED PLACES DIRECTORY & CARD GRID */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              📍 Registered Sustainability Hubs Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any facility card to auto-center and inspect its position on the map.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Showing {filteredPlaces.length} of {places.length} locations
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing map coordinates with database...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm font-bold text-slate-700 mb-1">No eco-locations found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No facilities matched your active search query or category filter. Try clearing your search or switch to "All Hubs".
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaces.map(place => {
              const isSelected = selectedPlace?.id === place.id;
              const cfg = getCategoryConfig(place.type);

              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg text-white ${cfg.bgClass}`}>
                        <span>{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </span>

                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                        {place.status || 'Verified Active'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 tracking-tight mb-2 hover:text-emerald-600 transition-colors">
                      {place.name}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 border border-slate-100 p-3 rounded-xl mb-4 line-clamp-3">
                      {place.description || place.note || 'Verified local green infrastructure asset.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="font-mono text-[10px] text-slate-400">
                      <span>LAT: {Number(place.latitude).toFixed(3)}</span> • <span>LNG: {Number(place.longitude).toFixed(3)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlace(place);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-2 py-1 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        Focus Map
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Directions</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default EcoMap;
