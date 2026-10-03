import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

type BarcodeScannerProps = {
  onDetected: (code: string) => void
  onClose: () => void
}

function cameraMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError') return 'Appka nemá povolenú kameru. Povoľ ju v nastaveniach telefónu, alebo opíš číslo spod kódu.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Kamera sa nenašla. Opíš číslo spod čiarového kódu.'
  return 'Kameru sa nepodarilo zapnúť. Opíš číslo spod čiarového kódu.'
}

// Skenovanie čiarového kódu zadnou kamerou; číslo sa dá opísať aj ručne.
export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectedRef = useRef(onDetected)
  const [message, setMessage] = useState('Zapínam kameru…')
  const [code, setCode] = useState('')

  useEffect(() => {
    detectedRef.current = onDetected
  })

  useEffect(() => {
    let stream: MediaStream | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false

    const start = async () => {
      try {
        const { createDetector } = await import('../lib/barcode')
        const detector = createDetector()
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        const video = videoRef.current
        if (stopped || !video) return
        video.srcObject = stream
        await video.play()
        setMessage('Namier kameru na čiarový kód na obale.')

        const scan = async () => {
          if (stopped) return
          try {
            const found = (await detector.detect(video)).find((item) => /^\d{8,14}$/.test(item.rawValue))
            if (found) {
              stopped = true
              detectedRef.current(found.rawValue)
              return
            }
          } catch {
            // jeden nepodarený snímok nevadí, skúsi sa ďalší
          }
          timer = setTimeout(scan, 200)
        }
        scan()
      } catch (error) {
        if (!stopped) setMessage(cameraMessage(error))
      }
    }
    start()

    return () => {
      stopped = true
      clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const digits = code.replace(/\s/g, '')
    if (/^\d{8,14}$/.test(digits)) onDetected(digits)
    else setMessage('Číslo kódu má 8 až 14 číslic.')
  }

  return (
    <div className="scanner" role="dialog" aria-modal="true" aria-label="Skenovanie čiarového kódu">
      <video ref={videoRef} className="scanner__video" playsInline muted />
      <div className="scanner__frame" aria-hidden="true" />
      <button type="button" className="scanner__close" onClick={onClose} aria-label="Zavrieť">
        <X size={26} aria-hidden="true" />
      </button>

      <div className="scanner__panel">
        <p className="scanner__message">{message}</p>
        <form className="scanner__manual" onSubmit={submit}>
          <input
            className="field"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="číslo spod kódu"
            aria-label="Číslo čiarového kódu"
            autoComplete="off"
          />
          <button type="submit" className="button button--primary" disabled={!code.trim()}>
            Hľadať
          </button>
        </form>
      </div>
    </div>
  )
}
