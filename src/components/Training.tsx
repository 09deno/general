import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { Exercise } from '../data/exercises'
import { parseDay, today } from '../lib/food'
import { findExercise, loadCustomExercises, loadPlan, newDay, savePlan, type Plan, type PlanDay } from '../lib/training'
import {
  createWorkout,
  deleteWorkout,
  doneSets,
  lastSets,
  loadRecent,
  nextPlanDay,
  setLabel,
  startSets,
  type Workout,
} from '../lib/workouts'
import DaySwitch from './DaySwitch'
import { exerciseCount, SplitPicker } from './TrainingPlan'

type Loaded = { day: string; plan: Plan | null; custom: Exercise[]; recent: Workout[] }

// Tréning: čo je dnes na rade podľa plánu a zapísané tréningy dňa. Plán sa upravuje na /trening/plan.
export default function Training() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [loaded, setLoaded] = useState<Loaded>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([loadPlan(), loadCustomExercises(), loadRecent(day)])
      .then(([plan, custom, recent]) => active && setLoaded({ day, plan, custom, recent }))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [day, attempt])

  const data = loaded?.day === day ? loaded : undefined
  // tréningy vybraného dňa, v poradí ako sa zapísali
  const workouts = data ? data.recent.filter((workout) => workout.day === day).reverse() : []

  const goToDay = (next: string) => {
    setError('')
    setParams(next === today() ? {} : { den: next }, { replace: true })
  }

  const start = async (planDay: PlanDay) => {
    if (!data) return
    setStarting(true)
    setError('')
    try {
      const exercises = planDay.exercises.flatMap((key) => {
        const exercise = findExercise(key, data.custom)
        if (!exercise) return []
        const { name, group, kind } = exercise
        return [{ key, name, group, kind, sets: startSets(lastSets(data.recent, key)?.sets) }]
      })
      const workout = await createWorkout({ day, plan_day_id: planDay.id, name: planDay.name, exercises })
      navigate(`/trening/zapis/${workout.id}`)
    } catch {
      setStarting(false)
      setError('Tréning sa nepodarilo začať. Skontroluj internet a skús to znova.')
    }
  }

  const remove = async (workout: Workout) => {
    try {
      await deleteWorkout(workout.id)
      if (data) setLoaded({ ...data, recent: data.recent.filter((item) => item.id !== workout.id) })
      setError('')
    } catch {
      setError('Tréning sa nepodarilo zmazať. Skontroluj internet a skús to znova.')
    }
  }

  const createPlan = async (split: string, days: string[]) => {
    try {
      await savePlan({ split, days: days.map(newDay) })
      // hneď na pridanie cvikov do dní
      navigate('/trening/plan')
    } catch {
      setError('Plán sa nepodarilo uložiť. Skontroluj internet a skús to znova.')
    }
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <span className="brand">Fit denník</span>
        <h1 className="screen__title">Tréning</h1>
      </header>

      {failed ? (
        <div className="food__notice">
          <p>Nepodarilo sa načítať tréningy. Skontroluj internet.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFailed(false)
              setAttempt((n) => n + 1)
            }}
          >
            Skúsiť znova
          </button>
        </div>
      ) : data?.plan === null ? (
        <SplitPicker onPick={createPlan} />
      ) : data?.plan ? (
        <div className="plan">
          <DaySwitch day={day} onChange={goToDay} />

          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} onDelete={() => remove(workout)} />
          ))}

          {workouts.length === 0 && (
            <StartCard
              key={day}
              plan={data.plan}
              suggested={nextPlanDay(data.plan.days, data.recent)}
              starting={starting}
              onStart={start}
            />
          )}

          <p className="plan__split training__plan">
            Tvoj plán: <b>{data.plan.split}</b>
          </p>
          <Link to="/trening/plan" className="button button--ghost">
            Upraviť plán
          </Link>
        </div>
      ) : null}

      {error && (
        <p className="food__notice food__notice--error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

// Deň, ktorý je na rade (po Push príde Pull…), s možnosťou vybrať iný deň plánu.
function StartCard(props: {
  plan: Plan
  suggested: PlanDay | undefined
  starting: boolean
  onStart: (day: PlanDay) => void
}) {
  const { plan } = props
  const [chosenId, setChosenId] = useState(props.suggested?.id)
  const chosen = plan.days.find((day) => day.id === chosenId) ?? props.suggested
  if (!chosen) return null

  return (
    <>
      <div className="card card--glow workout-start">
        <span className="remaining__label">Na rade je</span>
        <p className="workout-start__name">{chosen.name}</p>
        <p className="workout-start__info">
          {chosen.exercises.length > 0 ? exerciseCount(chosen.exercises.length) : 'Tento deň ešte nemá cviky.'}
        </p>
        {chosen.exercises.length > 0 ? (
          <button
            type="button"
            className="button button--primary"
            onClick={() => props.onStart(chosen)}
            disabled={props.starting}
          >
            Začať tréning
          </button>
        ) : (
          <Link to="/trening/plan" className="button button--primary">
            Pridať cviky
          </Link>
        )}
      </div>

      {plan.days.length > 1 && (
        <div className="add-food__group">
          <span className="add-food__label">Iný deň z plánu</span>
          <div className="chips">
            {plan.days.map((day) => (
              <button
                key={day.id}
                type="button"
                className={day.id === chosen.id ? 'chip chip--selected' : 'chip'}
                onClick={() => setChosenId(day.id)}
              >
                {day.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Zapísaný tréning: cviky s odcvičenými sériami.
function WorkoutCard({ workout, onDelete }: { workout: Workout; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const done = workout.exercises.filter((exercise) => doneSets(exercise).length > 0)

  return (
    <section className="card plan-day">
      {confirm ? (
        <div className="plan-day__confirm">
          <span>Zmazať tréning „{workout.name}“?</span>
          <button type="button" className="entry__confirm" onClick={onDelete}>
            Zmazať
          </button>
          <button type="button" className="entry__cancel" onClick={() => setConfirm(false)}>
            Nie
          </button>
        </div>
      ) : (
        <div className="plan-day__header">
          <h2 className="plan-day__name">{workout.name}</h2>
          <button
            type="button"
            className="plan-day__icon"
            onClick={() => setConfirm(true)}
            aria-label={`Zmazať tréning ${workout.name}`}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {done.length === 0 ? (
        <p className="plan-day__empty">Zatiaľ žiadna odcvičená séria.</p>
      ) : (
        <ul className="plan-day__list">
          {done.map((exercise) => (
            <li key={exercise.key} className="plan-exercise">
              <span className="plan-exercise__text">
                <span className="plan-exercise__name">{exercise.name}</span>
                <span className="workout-card__sets">
                  {doneSets(exercise)
                    .map((set) => setLabel(exercise.kind, set))
                    .join(' · ')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link to={`/trening/zapis/${workout.id}`} className="add-extra">
        {workout.day === today() ? 'Pokračovať v tréningu' : 'Upraviť tréning'}
      </Link>
    </section>
  )
}
