import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GUIDES, hasPhoto } from '../data/exerciseGuides'

// Fotka cviku: začiatok a koniec pohybu sa striedajú ako krátke video.
export function ExercisePhoto({ exerciseKey, name, large }: { exerciseKey: string; name: string; large?: boolean }) {
  if (!hasPhoto(exerciseKey)) return null
  return (
    <span className={large ? 'exercise-photo exercise-photo--large' : 'exercise-photo'} role="img" aria-label={`${name} – ako sa robí`}>
      <img src={`/exercises/${exerciseKey}-0.webp`} alt="" loading="lazy" />
      <img src={`/exercises/${exerciseKey}-1.webp`} alt="" loading="lazy" className="exercise-photo__end" />
    </span>
  )
}

// „Ako na to?“ – návod je schovaný a rozbalí sa až po ťuknutí (želanie majiteľa).
export function HowTo({ exerciseKey }: { exerciseKey: string }) {
  const [open, setOpen] = useState(false)
  const steps = GUIDES[exerciseKey]
  if (!steps) return null
  return (
    <div className="how-to">
      <button type="button" className="how-to__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Ako na to?
        <ChevronDown className={open ? 'how-to__chevron how-to__chevron--open' : 'how-to__chevron'} size={16} aria-hidden="true" />
      </button>
      {open && (
        <ol className="how-to__steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
