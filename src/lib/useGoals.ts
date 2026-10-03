import { useEffect, useState } from 'react'
import { loadGoals, type GoalsRow } from './goals'

// undefined = ešte sa načítava; null = používateľ ešte neprešiel úvodnými otázkami
export function useGoals(userId: string) {
  const [goals, setGoals] = useState<GoalsRow | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadGoals(userId)
      .then((row) => active && setGoals(row))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [userId, attempt])

  const retry = () => {
    setFailed(false)
    setAttempt((n) => n + 1)
  }

  return { goals, failed, retry, setGoals }
}
