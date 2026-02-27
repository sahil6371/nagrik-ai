import { useEffect, useRef, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function Step3({ result, location, preview }) {
  const canvasRef = useRef(null)
  const [roast, setRoast] = useState('')
  const [loading, setLoading] = useState(false)
  const [storyReady, setStoryReady] = useState(false)
  const [storyDataUrl, setStoryDataUrl] = useState(null)

  // Roast generate karo jab component load ho
  useEffect(() => {
    generateRoast()
  }, [])

  const generateRoast = async () => {
    setLoading(true)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const res = await model.generateContent(`
      Generate a funny Hindi-English Instagram story caption for this Mumbai civic issue.
      Issue: ${result.issueType}
      Area: ${location.ward.name}, Ward ${location.ward.ward}
      Severity: ${result.severity}

      Rules:
      - Max 2 lines only (it will go on image)
      - Funny + sarcastic roast of BMC
      - Must end with: @mybmc #FixMumbai #${location.ward.name.replace(' ', '')} #NagrikAI
      - Hindi-English mix (Hinglish)
      - Example: "Bhai yeh pothole itna purana hai ki isko Aadhaar card mil sakta tha 😂 @mybmc fix karo please 🙏 #FixMumbai #AndheriWest #NagrikAI"
      
      Only return the caption text, nothing else.
    `)
    const text = res.response.text().trim()
    setRoast(text)
    setLoading(false)
  }

  // Canvas pe story draw karo
  useEffect(() => {
    if (!roast || !preview) return
    drawStory()
  }, [roast])

  const drawStory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Instagram story size (9:16)
    canvas.width = 1080
    canvas.height = 1920

    const img = new Image()
    img.src = preview
    img.onload = () => {
      // Background — dark overlay
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, 1080, 1920)

      // Photo — center mein
      const imgAspect = img.width / img.height
      const drawW = 1080
      const drawH = drawW / imgAspect
      const drawY = (1920 - drawH) / 2
      ctx.drawImage(img, 0, drawY, drawW, drawH)

      // Dark gradient overlay — bottom pe
      const gradient = ctx.createLinearGradient(0, 1920 * 0.55, 0, 1920)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.92)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1920)

      // TOP — NagrikAI branding
      ctx.fillStyle = '#FF6B00'
      ctx.fillRect(0, 0, 1080, 100)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 52px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🇮🇳 NagrikAI — Mumbai Civic Report', 540, 68)

      // Issue badge
      const badgeColor = result.severity === 'High' ? '#e53e3e' :
                         result.severity === 'Medium' ? '#dd6b20' : '#38a169'
      ctx.fillStyle = badgeColor
      roundRect(ctx, 60, 130, 400, 80, 40)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 42px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`⚠️ ${result.issueType}`, 260, 182)

      // Severity badge
      ctx.fillStyle = '#ffffff22'
      roundRect(ctx, 480, 130, 280, 80, 40)
      ctx.fillStyle = badgeColor
      ctx.font = 'bold 40px Arial'
      ctx.fillText(`${result.severity} ⚡`, 620, 182)

      // Location
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 46px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`📍 ${location.ward.name}, Mumbai`, 60, 1480)

      ctx.fillStyle = '#ffcc00'
      ctx.font = '38px Arial'
      ctx.fillText(`🏛️ BMC Ward: ${location.ward.ward}`, 60, 1540)

      // Roast text — wrap karo
      ctx.fillStyle = '#ffffff'
      ctx.font = '44px Arial'
      ctx.textAlign = 'center'
      wrapText(ctx, roast, 540, 1620, 960, 56)

      // Bottom branding
      ctx.fillStyle = '#FF6B00'
      ctx.fillRect(0, 1840, 1080, 80)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 38px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Report issues at nagrik-ai-eta.vercel.app', 540, 1892)

      setStoryDataUrl(canvas.toDataURL('image/jpeg', 0.95))
      setStoryReady(true)
    }
  }

  // Text wrap helper
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line, x, y)
        line = words[i] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
  }

  // Rounded rect helper
  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
  }

  const downloadStory = () => {
    const a = document.createElement('a')
    a.href = storyDataUrl
    a.download = `nagrik-ai-story-${Date.now()}.jpg`
    a.click()
  }

  const copyCaption = () => {
    navigator.clipboard.writeText(roast)
    alert('Caption copied! Instagram pe paste karo 📋')
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📱 Instagram Story Ready!</h2>

      {loading && (
        <div style={styles.loadingBox}>
          <p style={styles.loadingText}>✍️ Roast likh raha hoon...</p>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Story Preview */}
      {storyReady && storyDataUrl && (
        <div style={styles.previewBox}>
          <img
            src={storyDataUrl}
            style={styles.storyImg}
            alt="Story Preview"
          />
        </div>
      )}

      {/* Roast text */}
      {roast && (
        <div style={styles.roastBox}>
          <p style={styles.roastText}>{roast}</p>
        </div>
      )}

      {/* Buttons */}
      {storyReady && (
        <div style={styles.btnGroup}>
          <button style={styles.btnOrange} onClick={downloadStory}>
            ⬇️ Story Download Karo
          </button>
          <button style={styles.btnGray} onClick={copyCaption}>
            📋 Caption Copy Karo
          </button>
          <button
            style={styles.btnWhite}
            onClick={() => window.dispatchEvent(new CustomEvent('restartApp'))}
          >
            🔄 Naya Issue Report Karo
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: 20, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' },
  heading: { textAlign: 'center', fontSize: 22, marginBottom: 16 },
  loadingBox: { textAlign: 'center', padding: 20 },
  loadingText: { color: '#FF6B00', fontWeight: 'bold', fontSize: 18 },
  previewBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  storyImg: { width: '100%', display: 'block' },
  roastBox: { background: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  roastText: { color: '#fff', fontSize: 14, lineHeight: 1.6, margin: 0 },
  btnGroup: { display: 'flex', flexDirection: 'column', gap: 10 },
  btnOrange: { padding: 14, background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  btnGray: { padding: 14, background: '#4a4a4a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer' },
  btnWhite: { padding: 14, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer' }
}