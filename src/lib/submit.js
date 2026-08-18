export const SUBMISSION_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbx2NgdnvvUTvtcXuRiROGJA-6XXZPZCe1qqRhlGE-RZrjwSdnUT-9nol1R9Eqm3-TUB/exec'

export function serializeSvg(svgNode) {
  if (!svgNode) return null
  const clone = svgNode.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '1200')
  clone.setAttribute('height', '900')
  clone.removeAttribute('class')
  return new XMLSerializer().serializeToString(clone)
}

export function svgToBase64Png(svgNode, stampText) {
  return new Promise((resolve, reject) => {
    const xml = serializeSvg(svgNode)
    if (!xml) return reject(new Error('no svg'))
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = 1200 * scale
      canvas.height = 900 * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      if (stampText) {
        const text = stampText.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
        ctx.font = '600 44px system-ui, sans-serif'
        const w = ctx.measureText(text).width
        const padX = 26
        const chipX = canvas.width - 56 - w - padX
        const chipY = canvas.height - 124
        ctx.fillStyle = 'rgba(9,9,11,0.85)'
        ctx.beginPath()
        ctx.roundRect(chipX, chipY, w + padX * 2, 68, 16)
        ctx.fill()
        ctx.fillStyle = '#e4e4e7'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, chipX + padX * 2 - 14, chipY + 34)
      }
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('svg render failed'))
    }
    img.src = url
  })
}

export async function submitSketch(svgNode, path, name) {
  const rawName = (name || '').trim()
  if (!rawName) {
    console.error('Upload error: no name provided')
    return false
  }
  const cleanName = rawName.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60)
  const base64Image = await svgToBase64Png(svgNode, rawName)
  if (!base64Image || base64Image.length < 100) {
    console.error('Upload error: image export returned no data')
    return false
  }
  const payload = {
    image: base64Image,
    submittedAt: new Date().toISOString(),
  }
  if (cleanName.trim()) {
    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)
    payload.name = `${cleanName.trim()}_${ts}`
  }
  try {
    await fetch(SUBMISSION_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    })
    return true
  } catch (err) {
    console.error('Upload error:', err)
    return false
  }
}