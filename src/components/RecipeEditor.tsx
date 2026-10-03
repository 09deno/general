import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { nutrition, type Food } from '../data/foods'
import { parseDay, today } from '../lib/food'
import {
  deleteRecipe,
  loadRecipe,
  portionLabel,
  recipeEntry,
  recipeTotal,
  saveRecipe,
  type RecipeItem,
} from '../lib/recipes'
import {
  amount,
  AmountPicker,
  defaultAmount,
  FoodSearch,
  ManualForm,
  NutritionCard,
  parseNumber,
  validAmount,
  ValuesCard,
  type Part,
} from './AddFood'
import { Stepper } from './Onboarding'

// čo je práve na obrazovke: recept, hľadanie suroviny, množstvo zvolenej suroviny, ručné zadanie
type View = 'recipe' | 'search' | 'manual' | Part

// Nový recept zo surovín (napr. „Mamina sviečková“ na 4 porcie) alebo úprava receptu / uloženého jedla.
export default function RecipeEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [loaded, setLoaded] = useState(!id)
  const [name, setName] = useState('')
  const [portions, setPortions] = useState(4)
  const [items, setItems] = useState<RecipeItem[]>([])
  const [view, setView] = useState<View>('recipe')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    loadRecipe(id)
      .then((recipe) => {
        if (!active) return
        if (recipe) {
          setName(recipe.name)
          setPortions(recipe.portions)
          setItems(recipe.items)
        } else setError('Tento recept už neexistuje.')
        setLoaded(true)
      })
      .catch(() => active && setError('Recept sa nepodarilo načítať. Skontroluj internet.'))
    return () => {
      active = false
    }
  }, [id])

  const leave = () => navigate(day === today() ? '/jedlo/pridat' : `/jedlo/pridat?den=${day}`, { replace: true })

  const back = () => {
    setError('')
    if (view === 'recipe') leave()
    else if (view === 'search') setView('recipe')
    else setView('search')
  }

  const addItem = (item: RecipeItem) => {
    setItems((current) => [...current, item])
    setView('recipe')
  }

  const addPart = (part: Part) => {
    const grams = parseNumber(part.grams)
    const values = nutrition(part.food, grams)
    addItem({
      name: part.food.name,
      kcal: values.kcal,
      protein_g: values.protein,
      carbs_g: values.carbs,
      fat_g: values.fat,
      grams: Math.round(grams * 10) / 10,
      unit: part.food.unit,
    })
  }

  const save = async () => {
    if (!name.trim()) return setError('Napíš názov receptu.')
    if (items.length === 0) return setError('Pridaj aspoň jednu surovinu.')
    setBusy(true)
    setError('')
    try {
      await saveRecipe({ id, name: name.trim().slice(0, 60), portions, items })
      leave()
    } catch {
      setBusy(false)
      setError('Recept sa nepodarilo uložiť. Skontroluj internet a skús to znova.')
    }
  }

  const remove = async () => {
    if (!id) return
    setBusy(true)
    try {
      await deleteRecipe(id)
      leave()
    } catch {
      setBusy(false)
      setConfirmDelete(false)
      setError('Recept sa nepodarilo zmazať. Skontroluj internet a skús to znova.')
    }
  }

  const title =
    view === 'search'
      ? 'Pridať surovinu'
      : view === 'manual'
        ? 'Zadať ručne'
        : typeof view === 'object'
          ? view.food.name
          : id
            ? 'Upraviť recept'
            : 'Nový recept'

  const perPortion = recipeEntry({ id: '', name, portions, items }, 1)

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={back} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="add-food__heading">
          <h1 className="add-food__title">{title}</h1>
          {view !== 'recipe' && <span className="add-food__day">do receptu {name.trim() || 'bez názvu'}</span>}
        </div>
      </header>

      <div className="add-food">
        {view === 'search' ? (
          <>
            <FoodSearch
              placeholder="Hľadaj surovinu, napr. hovädzie, cibuľa"
              onPick={(food: Food) => setView({ food, grams: defaultAmount(food) })}
            />
            <button type="button" className="text-button" onClick={() => setView('manual')}>
              Nenašiel si? Zadaj ručne
            </button>
          </>
        ) : view === 'manual' ? (
          <ManualForm ingredient busy={false} error={error} onError={setError} onSave={addItem} />
        ) : typeof view === 'object' ? (
          <>
            <AmountPicker part={view} onChange={(grams) => setView({ ...view, grams })} />
            <NutritionCard parts={[view]} />
            <button
              type="button"
              className="button button--primary"
              disabled={!validAmount(parseNumber(view.grams))}
              onClick={() => addPart(view)}
            >
              Pridať surovinu
            </button>
          </>
        ) : !loaded ? (
          error && <p className="food__notice food__notice--error">{error}</p>
        ) : (
          <>
            <label className="add-food__group">
              <span className="add-food__label">Názov</span>
              <input
                className="field"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="napr. Mamina sviečková"
                maxLength={60}
                autoComplete="off"
              />
            </label>

            <Stepper
              label="Na koľko porcií?"
              display={portionLabel(portions)}
              value={portions}
              step={1}
              min={1}
              max={20}
              onChange={setPortions}
            />

            <div className="add-food__group">
              <span className="add-food__label">Suroviny</span>
              {items.length > 0 && (
                <ul className="extras">
                  {items.map((item, index) => (
                    <li key={index} className="extra">
                      <span className="extra__name">{item.name}</span>
                      <span className="extra__info">
                        {item.grams ? `${amount(Number(item.grams))} ${item.unit} · ` : ''}
                        {item.kcal.toLocaleString('sk')} kcal
                      </span>
                      <button
                        type="button"
                        className="extra__remove"
                        onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        aria-label={`Odobrať ${item.name}`}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="add-extra" onClick={() => setView('search')}>
                <Plus size={18} aria-hidden="true" />
                Pridať surovinu
              </button>
            </div>

            {items.length > 0 && (
              <div className="add-food__group">
                <span className="add-food__label">1 porcia</span>
                <ValuesCard
                  values={{
                    kcal: perPortion.kcal,
                    protein: perPortion.protein_g,
                    carbs: perPortion.carbs_g,
                    fat: perPortion.fat_g,
                  }}
                />
                {portions > 1 && (
                  <p className="search__hint">Celý recept: {recipeTotal(items).kcal.toLocaleString('sk')} kcal.</p>
                )}
              </div>
            )}

            {error && (
              <p className="flow__message flow__message--error" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="button button--primary" disabled={busy} onClick={save}>
              {busy ? 'Ukladám…' : 'Uložiť recept'}
            </button>

            {id &&
              (confirmDelete ? (
                <div className="plan-day__confirm">
                  <span>Zmazať recept „{name}“?</span>
                  <button type="button" className="entry__confirm" onClick={remove} disabled={busy}>
                    Zmazať
                  </button>
                  <button type="button" className="entry__cancel" onClick={() => setConfirmDelete(false)}>
                    Nie
                  </button>
                </div>
              ) : (
                <button type="button" className="text-button text-button--muted" onClick={() => setConfirmDelete(true)}>
                  Zmazať recept
                </button>
              ))}
          </>
        )}
      </div>
    </section>
  )
}
