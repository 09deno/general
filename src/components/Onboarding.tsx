import { useState, type FormEvent } from 'react'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import TargetCard from './TargetCard'
import {
  answersFromRow,
  calculate,
  GOAL_LABELS,
  macros,
  maxProtein,
  MAX_KCAL,
  MIN_PROTEIN,
  saveGoals,
  type Activity,
  type Answers,
  type Goal,
  type GoalsRow,
  type Sex,
} from '../lib/goals'

type Step = 'sex' | 'age' | 'height' | 'weight' | 'activity' | 'goal' | 'result'
const QUESTIONS: Step[] = ['sex', 'age', 'height', 'weight', 'activity', 'goal']

type OnboardingProps = {
  userId: string
  onDone: (goals: GoalsRow) => void
  // pri zmene cieľov z Nastavení: predvyplnené odpovede a návrat späť bez uloženia
  initial?: GoalsRow
  onCancel?: () => void
}

// Úvodné otázky po registrácii – jedna otázka na obrazovku, na konci denný cieľ.
// Tie isté otázky (s predvyplnenými odpoveďami) slúžia aj na zmenu cieľov.
export default function Onboarding({ userId, onDone, initial, onCancel }: OnboardingProps) {
  const [step, setStep] = useState<Step>('sex')
  const [answers, setAnswers] = useState<Partial<Answers>>(() => (initial ? answersFromRow(initial) : {}))
  const index = step === 'result' ? QUESTIONS.length : QUESTIONS.indexOf(step)

  const answer = (values: Partial<Answers>) => {
    setAnswers({ ...answers, ...values })
    setStep(index + 1 < QUESTIONS.length ? QUESTIONS[index + 1] : 'result')
  }

  const back = () => (index === 0 ? onCancel?.() : setStep(QUESTIONS[index - 1]))

  return (
    <div className="flow">
      <div className="flow__top">
        <button
          type="button"
          className="flow__back"
          onClick={back}
          aria-label="Späť"
          style={{ visibility: index === 0 && !onCancel ? 'hidden' : 'visible' }}
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="progress" aria-label={`Krok ${Math.min(index + 1, QUESTIONS.length)} zo ${QUESTIONS.length}`}>
          {QUESTIONS.map((question, i) => (
            <span key={question} className={i < index || step === 'result' ? 'progress__done' : undefined} />
          ))}
        </div>
      </div>

      {step === 'sex' && (
        <ChoiceStep<Sex>
          title="Si muž alebo žena?"
          lead="Podľa toho sa počítajú kalórie."
          options={[
            { value: 'male', label: 'Muž' },
            { value: 'female', label: 'Žena' },
          ]}
          selected={answers.sex}
          onPick={(sex) => answer({ sex })}
        />
      )}
      {step === 'age' && (
        <NumberStep
          title="Koľko máš rokov?"
          unit="rokov"
          min={10}
          max={100}
          value={answers.age}
          onNext={(age) => answer({ age })}
        />
      )}
      {step === 'height' && (
        <NumberStep
          title="Koľko meriaš?"
          unit="cm"
          min={120}
          max={230}
          value={answers.heightCm}
          onNext={(heightCm) => answer({ heightCm })}
        />
      )}
      {step === 'weight' && (
        <NumberStep
          title="Koľko vážiš?"
          lead="Stačí približne, napríklad 72,5."
          unit="kg"
          min={30}
          max={250}
          decimals
          value={answers.weightKg}
          onNext={(weightKg) => answer({ weightKg })}
        />
      )}
      {step === 'activity' && (
        <ChoiceStep<Activity>
          title="Ako často športuješ?"
          lead="Fitko aj iný šport dokopy."
          options={[
            { value: 'none', label: 'Skoro vôbec' },
            { value: 'low', label: '1–2× do týždňa' },
            { value: 'medium', label: '3–4× do týždňa' },
            { value: 'high', label: '5× a viac do týždňa' },
          ]}
          selected={answers.activity}
          onPick={(activity) => answer({ activity })}
        />
      )}
      {step === 'goal' && (
        <ChoiceStep<Goal>
          title="Čo chceš dosiahnuť?"
          options={[
            { value: 'lose', label: GOAL_LABELS.lose, hint: 'Zhodiť tuk a pár kíl.' },
            { value: 'recomp', label: GOAL_LABELS.recomp, hint: 'Menej tuku, viac svalov, váha zhruba rovnaká.' },
            { value: 'maintain', label: GOAL_LABELS.maintain, hint: 'Ostať tak, ako som.' },
            { value: 'gain', label: GOAL_LABELS.gain, hint: 'Pribrať svaly, aj keď váha trochu stúpne.' },
          ]}
          selected={answers.goal}
          onPick={(goal) => answer({ goal })}
        />
      )}
      {step === 'result' && (
        // pri zmene odpovedí sa výsledok aj ručné úpravy prepočítajú nanovo
        <Result
          key={JSON.stringify(answers)}
          userId={userId}
          answers={answers as Answers}
          saveLabel={initial ? 'Uložiť' : 'Začať'}
          onDone={onDone}
        />
      )}
    </div>
  )
}

type Option<T> = { value: T; label: string; hint?: string }

function ChoiceStep<T extends string>(props: {
  title: string
  lead?: string
  options: Option<T>[]
  selected?: T
  onPick: (value: T) => void
}) {
  return (
    <>
      <header>
        <h1 className="flow__title">{props.title}</h1>
        {props.lead && <p className="flow__lead">{props.lead}</p>}
      </header>
      <div className="choices">
        {props.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === props.selected ? 'choice choice--selected' : 'choice'}
            onClick={() => props.onPick(option.value)}
          >
            <span className="choice__label">{option.label}</span>
            {option.hint && <span className="choice__hint">{option.hint}</span>}
          </button>
        ))}
      </div>
    </>
  )
}

function NumberStep(props: {
  title: string
  lead?: string
  unit: string
  min: number
  max: number
  decimals?: boolean
  value?: number
  onNext: (value: number) => void
}) {
  const [text, setText] = useState(props.value === undefined ? '' : String(props.value).replace('.', ','))
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const number = Number(text.trim().replace(',', '.'))
    const value = props.decimals ? Math.round(number * 10) / 10 : Math.round(number)
    if (!text.trim() || !Number.isFinite(number) || value < props.min || value > props.max) {
      setError(`Zadaj číslo od ${props.min} do ${props.max}.`)
      return
    }
    props.onNext(value)
  }

  return (
    <>
      <header>
        <h1 className="flow__title">{props.title}</h1>
        {props.lead && <p className="flow__lead">{props.lead}</p>}
      </header>
      <form className="flow__form" onSubmit={submit}>
        <label className="number-field">
          <input
            className="field number-field__input"
            type="text"
            inputMode={props.decimals ? 'decimal' : 'numeric'}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError('')
            }}
            aria-label={props.title}
            autoComplete="off"
            enterKeyHint="next"
            autoFocus
          />
          <span className="number-field__unit">{props.unit}</span>
        </label>
        {error && (
          <p className="flow__message flow__message--error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary" disabled={!text.trim()}>
          Pokračovať
        </button>
      </form>
    </>
  )
}

const EXPLANATION: Record<Goal, string> = {
  lose: 'Keď zješ o trochu menej, budeš chudnúť pomaly a bezpečne.',
  recomp: 'Zješ len o máličko menej – tuk pôjde dole a s tréningom pribudnú svaly.',
  maintain: 'Keď zješ približne toľko, tvoja váha ostane rovnaká.',
  gain: 'Keď zješ o trochu viac a trénuješ, budeš naberať svaly.',
}

function Result(props: {
  userId: string
  answers: Answers
  saveLabel: string
  onDone: (goals: GoalsRow) => void
}) {
  const { userId, answers, saveLabel, onDone } = props
  const result = calculate(answers)
  const [kcal, setKcal] = useState(result.kcal)
  const [protein, setProtein] = useState(result.proteinG)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const targets = macros(kcal, protein)
  // mladší ako 18 rokov, ktorý chcel chudnúť: dostane udržiavací príjem a vysvetlenie
  const youthNote = result.youth && (answers.goal === 'lose' || answers.goal === 'recomp')

  const changeKcal = (value: number) => {
    setKcal(value)
    setProtein(Math.min(protein, maxProtein(value)))
  }

  const finish = async () => {
    setBusy(true)
    setError('')
    try {
      onDone(await saveGoals(userId, answers, targets))
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  return (
    <>
      <header>
        <h1 className="flow__title">Tvoj denný cieľ</h1>
      </header>

      <TargetCard targets={targets} />

      <div className="explain">
        <p>
          Za deň spáliš asi <b>{result.maintenance.toLocaleString('sk')} kcal</b>.{' '}
          {youthNote
            ? 'Kým máš menej ako 18 rokov, nedrž diétu – telo ešte rastie. Jedz toľko, koľko spáliš, a trénuj; postava sa zlepší sama.'
            : EXPLANATION[answers.goal]}
        </p>
        <p>Bielkoviny pomáhajú svalom a zasýtia – snaž sa ich každý deň dať čo najviac zo svojho cieľa.</p>
      </div>

      {editing ? (
        <div className="card adjust">
          <Stepper
            label="Kalórie"
            unit="kcal"
            value={kcal}
            step={50}
            min={result.minKcal}
            max={MAX_KCAL}
            onChange={changeKcal}
          />
          <Stepper
            label="Bielkoviny"
            unit="g"
            value={targets.proteinG}
            step={5}
            min={MIN_PROTEIN}
            max={maxProtein(kcal)}
            onChange={setProtein}
          />
          {kcal === result.minKcal && <p className="adjust__note">Menej kalórií sa neodporúča.</p>}
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => setEditing(true)}>
          Upraviť ručne
        </button>
      )}

      <div className="flow__bottom">
        {error && (
          <p className="flow__message flow__message--error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="button button--primary" onClick={finish} disabled={busy}>
          {busy ? 'Ukladám…' : saveLabel}
        </button>
      </div>
    </>
  )
}

function Stepper(props: {
  label: string
  unit: string
  value: number
  step: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const { label, unit, value, step, min, max, onChange } = props
  return (
    <div className="stepper">
      <span className="stepper__label">{label}</span>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`${label} menej`}
      >
        <Minus size={20} aria-hidden="true" />
      </button>
      <span className="stepper__value">
        {value.toLocaleString('sk')} {unit}
      </span>
      <button
        type="button"
        className="stepper__button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`${label} viac`}
      >
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  )
}
