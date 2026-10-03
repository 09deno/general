import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// undefined = appka ešte nezistila, či je niekto prihlásený; null = nikto nie je prihlásený.
// Prihlásenie sa pamätá v telefóne natrvalo, takže PIN treba len na novom zariadení.
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, current) => setSession(current))
    return () => data.subscription.unsubscribe()
  }, [])

  return session
}
