import { ChevronLeft, ChevronRight } from 'lucide-react'
import { dayLabel, shiftDay, today } from '../lib/food'

// Šípky na prepínanie dní – dozadu áno, do budúcnosti nie.
export default function DaySwitch({ day, onChange }: { day: string; onChange: (day: string) => void }) {
  return (
    <div className="day-switch">
      <button type="button" className="day-switch__button" onClick={() => onChange(shiftDay(day, -1))} aria-label="Predchádzajúci deň">
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <span className="day-switch__label">{dayLabel(day)}</span>
      <button
        type="button"
        className="day-switch__button"
        onClick={() => onChange(shiftDay(day, 1))}
        disabled={day >= today()}
        aria-label="Ďalší deň"
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </div>
  )
}
