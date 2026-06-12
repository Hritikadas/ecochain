import { useState, useEffect } from 'react';
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
    ev: '#2196f3',
    recycling: '#ff9800',
    organic: '#4caf50',
    park: '#9c27b0'
  };
  
  const color = colors[type] || '#2e7d32';
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

function EcoMap() {
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

  // Default location: Airoli, Maharashtra (near user's location)
  const defaultLocation = [19.2183, 72.9713];

  useEffect(() => {
    fetchPlaces();
  }, [filter]);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`/api/places?type=${filter}`);
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
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
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/places/add', {
        user_id: 1, // For demo
        ...formData
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
      fetchPlaces();
    } catch (error) {
      console.error('Error adding place:', error);
      alert('❌ Failed to add place. Please try again.');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All', color: '#2e7d32' },
    { value: 'ev', label: 'EV Charging', color: '#2196f3' },
    { value: 'recycling', label: 'Recycling', color: '#ff9800' },
    { value: 'organic', label: 'Organic Stores', color: '#4caf50' },
    { value: 'park', label: 'Parks', color: '#9c27b0' }
  ];

  return (
    <div>
      <h1>🗺️ Eco-Friendly Places Map</h1>
      
      {/* Filter Buttons */}
      <div className="filter-buttons">
        {filterOptions.map(option => (
          <button
            key={option.value}
            className={`filter-btn ${filter === option.value ? 'active' : ''}`}
            onClick={() => setFilter(option.value)}
            style={filter === option.value ? { backgroundColor: option.color, color: 'white' } : {}}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Add Place Button */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ 
          padding: '10px 20px', 
          background: '#2e7d32', 
          color: 'white', 
          border: 'none', 
          cursor: 'pointer',
          marginBottom: '20px',
          borderRadius: '4px'
        }}
      >
        {showForm ? 'Cancel' : '+ Add Eco Place'}
      </button>

      {/* Add Place Form */}
      {showForm && (
        <div className="add-place-form">
          <h3>Add New Eco-Friendly Place</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Place Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="ev">EV Charging Station</option>
                <option value="recycling">Recycling Center</option>
                <option value="organic">Organic Store</option>
                <option value="park">Park</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <button
                type="button"
                onClick={handleLocationSelect}
                style={{ 
                  padding: '8px 16px', 
                  background: '#2196f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📍 Use My Current Location
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Latitude:</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Longitude:</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Note (optional):</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '10px 20px', 
                background: '#2e7d32', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Add Place
            </button>
          </form>
        </div>
      )}

      {/* Map */}
      <div className="map-container">
        <MapContainer 
          center={defaultLocation} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          
          {places.map(place => (
            <Marker 
              key={place.id} 
              position={[place.latitude, place.longitude]}
              icon={getIcon(place.type)}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>{place.name}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>
                    <strong>Type:</strong> {place.type}
                  </p>
                  {place.note && (
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                      {place.note}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Places List */}
      <div style={{ marginTop: '20px' }}>
        <h3>📍 {filter === 'all' ? 'All' : filterOptions.find(f => f.value === filter)?.label} Places</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {places.map(place => (
            <div key={place.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px',
              background: 'white'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>{place.name}</h4>
              <span style={{ 
                display: 'inline-block', 
                padding: '4px 8px', 
                background: filterOptions.find(f => f.value === place.type)?.color || '#2e7d32',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {place.type}
              </span>
              {place.note && (
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                  {place.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {places.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            No places found for this category. Be the first to add one!
          </p>
        )}
      </div>
    </div>
  );
}

export default EcoMap;