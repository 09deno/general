import { supabase } from './supabase'

export type LoginRequest =
  | { step: 'code'; code: string }
  | { step: 'nickname'; code: string; nickname: string }
  | { step: 'pin'; code: string; nickname: string; pin: string; isNew: boolean }

export type LoginReply = {
  ok?: true
  error?: string
  attemptsLeft?: number
  minutes?: number
  exists?: boolean
  nickname?: string
  session?: { access_token: string; refresh_token: string }
}

// rovnaké pravidlo kontroluje aj server
export const NICKNAME = /^[\p{L}0-9_]{3,20}$/u

// Pozývací kód, prezývku aj PIN kontroluje server – funkcia login v Supabase (supabase/functions/login).
export async function callLogin(request: LoginRequest): Promise<LoginReply> {
  const { data, error } = await supabase.functions.invoke<LoginReply>('login', { body: request })
  return error || !data ? { error: 'network' } : data
}

export function errorMessage(reply: LoginReply): string {
  switch (reply.error) {
    case 'wrong_code':
      return `Nesprávny pozývací kód. ${attemptsLeft(reply.attemptsLeft)}`
    case 'wrong_pin':
      return `Nesprávny PIN. ${attemptsLeft(reply.attemptsLeft)}`
    case 'blocked':
      return `Priveľa nesprávnych pokusov. Skús to znova o ${reply.minutes} min.`
    case 'invalid_nickname':
      return 'Prezývka môže mať 3 až 20 znakov – písmená, čísla a podčiarkovník.'
    case 'nickname_taken':
      return 'Túto prezývku si práve vybral niekto iný. Skús inú.'
    case 'unknown_nickname':
      return 'Takú prezývku nepoznáme. Skontroluj ju.'
    default:
      return 'Nepodarilo sa spojiť so serverom. Skontroluj internet a skús to znova.'
  }
}

function attemptsLeft(count = 0) {
  if (count === 1) return 'Ostáva posledný pokus.'
  if (count <= 4) return `Ostávajú ${count} pokusy.`
  return `Ostáva ${count} pokusov.`
}
