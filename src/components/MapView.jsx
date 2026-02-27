import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ location, result }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: 300, width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        <Marker position={[location.lat, location.lng]}>
          <Popup>
            <b>{result.issueType}</b><br />
            {result.description}<br />
            <span style={{ color: result.severity === 'High' ? 'red' : 'orange' }}>
              Severity: {result.severity}
            </span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}