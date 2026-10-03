import { GOAL_LABELS, targetsFromRow, type GoalsRow } from '../lib/goals'
import TargetCard from './TargetCard'

type SettingsProps = {
  goals: GoalsRow
  onChangeGoals: () => void
}

// Nastavenia – zatiaľ denný cieľ a jeho zmena.
export default function Settings({ goals, onChangeGoals }: SettingsProps) {
  return (
    <section className="screen">
      <header className="screen__header">
        <span className="brand">Fit denník</span>
        <h1 className="screen__title">Nastavenia</h1>
      </header>

      <div className="settings">
        <h2 className="settings__heading">Tvoj denný cieľ</h2>
        <TargetCard targets={targetsFromRow(goals)} />
        <p className="settings__summary">
          {GOAL_LABELS[goals.goal]} · {goals.weight_kg.toLocaleString('sk')} kg
        </p>
        <button type="button" className="button button--primary" onClick={onChangeGoals}>
          Zmeniť ciele
        </button>
        <p className="settings__hint">Keď sa ti zmení váha alebo začneš športovať inak, prepočítaj si ciele.</p>
      </div>
    </section>
  )
}
