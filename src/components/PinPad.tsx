import { useEffect, useState, type ReactNode } from 'react'
import { Delete } from 'lucide-react'

const LENGTH = 6
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

type PinPadProps = {
  disabled: boolean
  onComplete: (pin: string) => void
  children?: ReactNode
}

// Zadávanie 6-miestneho PIN-u veľkými tlačidlami (na dosah palca); na počítači funguje aj klávesnica.
export default function PinPad({ disabled, onComplete, children }: PinPadProps) {
  const [pin, setPin] = useState('')

  const press = (key: string) => {
    if (disabled) return
    if (key === 'back') {
      setPin(pin.slice(0, -1))
      return
    }
    if (pin.length === LENGTH) return
    const next = pin + key
    setPin(next)
    if (next.length === LENGTH) onComplete(next)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) press(event.key)
      else if (event.key === 'Backspace') press('back')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="pin">
      <div className="pin__dots" role="img" aria-label={`Zadané ${pin.length} zo ${LENGTH} číslic`}>
        {Array.from({ length: LENGTH }, (_, i) => (
          <span key={i} className={i < pin.length ? 'pin__dot pin__dot--filled' : 'pin__dot'} />
        ))}
      </div>

      {children}

      <div className="pin__keys">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              className={key === 'back' ? 'pin__key pin__key--back' : 'pin__key'}
              disabled={disabled}
              onClick={() => press(key)}
              aria-label={key === 'back' ? 'Vymazať číslicu' : undefined}
            >
              {key === 'back' ? <Delete size={26} strokeWidth={1.75} aria-hidden="true" /> : key}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
