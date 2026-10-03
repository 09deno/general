import type { Targets } from '../lib/goals'

// Tmavá karta s denným cieľom: veľké číslo kalórií a pod ním bielkoviny, sacharidy, tuky.
export default function TargetCard({ targets }: { targets: Targets }) {
  return (
    <div className="card card--glow target">
      <span className="target__label">Denne zjedz</span>
      <p className="target__kcal">
        {targets.kcal.toLocaleString('sk')} <span>kcal</span>
      </p>
      <div className="macros">
        <Macro kind="protein" label="Bielkoviny" grams={targets.proteinG} />
        <Macro kind="carbs" label="Sacharidy" grams={targets.carbsG} />
        <Macro kind="fat" label="Tuky" grams={targets.fatG} />
      </div>
    </div>
  )
}

function Macro({ kind, label, grams }: { kind: 'protein' | 'carbs' | 'fat'; label: string; grams: number }) {
  return (
    <div className={`macro macro--${kind}`}>
      <span className="macro__value">{grams} g</span>
      <span className="macro__label">{label}</span>
    </div>
  )
}
