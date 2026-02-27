import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import MapView from './components/MapView'
import 'leaflet/dist/leaflet.css'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function App() {
  const [result, setResult] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState(1)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)

    // GPS Location
    navigator.geolocation.getCurrentPosition(
  (pos) => {
    setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    })
  },
  (err) => {
    console.log("GPS Error:", err.message)
    setLocation({ lat: 19.0760, lng: 72.8777 })
  },
  {
    enableHighAccuracy: true,  // Ye add karo
    timeout: 10000,
    maximumAge: 0
  }
)

    // Gemini AI
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const res = await model.generateContent([
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        `You are a Mumbai civic issue detector.
         Analyze this image and reply ONLY in JSON:
         {
           "issueType": "Pothole/Garbage/Broken Streetlight/Waterlogging/Other",
           "severity": "Low/Medium/High",
           "description": "one line description in English",
           "area": "best guess of Mumbai area name or Unknown"
         }`
      ])

      const text = res.response.text()
      const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
      setResult(JSON.parse(clean))
      setLoading(false)
      setStep(2)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🇮🇳 NagrikAI</h1>
      <p style={styles.subtitle}>Mumbai ki awaaz, AI ki taakat</p>

      {step === 1 && (
        <div style={styles.uploadBox}>
          <p>📸 Issue ki photo lo</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={styles.input}
          />
          {preview && <img src={preview} style={styles.preview} />}
          {loading && <p style={styles.loading}>🤖 AI analyze kar raha hai...</p>}
        </div>
      )}

      {step === 2 && result && location && (
        <div>
          {/* AI Result */}
          <div style={styles.resultBox}>
            <h3>🤖 AI Detection</h3>
            <p><b>Issue:</b> {result.issueType}</p>
            <p><b>Severity:</b> 
              <span style={{
                color: result.severity === 'High' ? 'red' : 
                       result.severity === 'Medium' ? 'orange' : 'green'
              }}> {result.severity}</span>
            </p>
            <p><b>Description:</b> {result.description}</p>
            <p><b>Area:</b> {result.area}</p>
          </div>

          {/* Map */}
          <MapView location={location} result={result} />

          <button 
            style={styles.button}
            onClick={() => setStep(3)}
          >
            📧 Complaint Bhejo →
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={styles.resultBox}>
          <h3>✅ Coming Next!</h3>
          <p>Email + Roast Generator</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 480, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' },
  title: { textAlign: 'center', fontSize: 28, marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  uploadBox: { textAlign: 'center', border: '2px dashed #ccc', borderRadius: 12, padding: 20 },
  input: { marginTop: 10 },
  preview: { width: '100%', borderRadius: 8, marginTop: 10 },
  loading: { color: '#FF6B00', fontWeight: 'bold' },
  resultBox: { background: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 16 },
  button: { width: '100%', padding: 14, background: '#FF6B00', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer' }
}