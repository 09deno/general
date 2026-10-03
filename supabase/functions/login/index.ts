// Registrácia a prihlásenie: pozývací kód → prezývka → PIN.
// Beží na serveri Supabase, takže kód aj PIN kontroluje server, nie appka.
// Nasadená s verify_jwt = false – volá sa ešte pred prihlásením, s verejným kľúčom.
import { createClient, type Session } from 'npm:@supabase/supabase-js@2'

const MAX_ATTEMPTS = 5
const BLOCK_MINUTES = 15
const NICKNAME = /^[\p{L}0-9_]{3,20}$/u
const PIN = /^[0-9]{6}$/
// Účet v Supabase potrebuje e-mail. Appka žiadne e-maily neposiela, adresa je len vnútorné meno účtu
// a je náhodná, aby sa PIN nedal skúšať priamo mimo tejto funkcie (a obísť tak blokovanie).
const EMAIL_DOMAIN = 'fit-dennik.invalid'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const url = Deno.env.get('SUPABASE_URL')!
const secretKey = apiKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY')
const publishableKey = apiKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY')
const noSession = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(url, secretKey, noSession)

function apiKey(newKeys: string, legacyKey: string): string {
  const keys = Deno.env.get(newKeys)
  return (keys && JSON.parse(keys).default) || Deno.env.get(legacyKey)!
}

type LoginInput = { step?: string; code?: unknown; nickname?: unknown; pin?: unknown; isNew?: unknown }
type Reply = Record<string, unknown>
type Profile = { id: string; nickname: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return json({ error: 'bad_request' }, 405)
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    return json(await handle(await req.json(), ip))
  } catch (error) {
    console.error(error)
    return json({ error: 'server' }, 500)
  }
})

function json(body: Reply, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function handle(input: LoginInput, ip: string): Promise<Reply> {
  const codeError = await checkInviteCode(text(input.code), ip)
  if (codeError) return codeError
  if (input.step === 'code') return { ok: true }

  const nickname = text(input.nickname).normalize('NFC')
  if (!NICKNAME.test(nickname)) return { error: 'invalid_nickname' }
  const nicknameKey = nickname.toLocaleLowerCase('sk')
  const profile = await findProfile(nicknameKey)
  if (input.step === 'nickname') return { ok: true, exists: !!profile, nickname: profile?.nickname ?? nickname }

  if (input.step !== 'pin') return { error: 'bad_request' }
  const pin = text(input.pin)
  if (!PIN.test(pin)) return { error: 'bad_request' }
  if (input.isNew === true) return profile ? { error: 'nickname_taken' } : register(nickname, nicknameKey, pin)
  return profile ? signIn(profile, pin) : { error: 'unknown_nickname' }
}

// ---------- Pozývací kód ----------

// Veľké a malé písmená ani diakritika nehrajú rolu: „Športovec“ = „sportovec“.
function comparable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('sk').trim()
}

async function checkInviteCode(code: string, ip: string): Promise<Reply | null> {
  const key = `code:${ip}`
  const attempts = await getAttempts(key)
  if (attempts.blockedUntil) return blocked(attempts.blockedUntil)

  const { data, error } = await admin.from('app_settings').select('value').eq('key', 'invite_code').single()
  if (error) throw error
  if (comparable(code) !== comparable(data.value)) return failedAttempt(key, attempts.count, 'wrong_code')
  if (attempts.count) await clearAttempts(key)
  return null
}

// ---------- Účty ----------

async function findProfile(nicknameKey: string): Promise<Profile | null> {
  const { data, error } = await admin.from('profiles').select('id, nickname').eq('nickname_key', nicknameKey).maybeSingle()
  if (error) throw error
  return data
}

async function signIn(profile: Profile, pin: string): Promise<Reply> {
  const key = `pin:${profile.id}`
  const attempts = await getAttempts(key)
  if (attempts.blockedUntil) return blocked(attempts.blockedUntil)

  const { data, error } = await admin.auth.admin.getUserById(profile.id)
  if (error) throw error
  const result = await passwordSignIn(data.user.email!, pin)
  if (result === 'wrong_pin') return failedAttempt(key, attempts.count, 'wrong_pin')
  if (attempts.count) await clearAttempts(key)
  return { ok: true, session: result }
}

async function register(nickname: string, nicknameKey: string, pin: string): Promise<Reply> {
  const email = `${crypto.randomUUID()}@${EMAIL_DOMAIN}`
  const { data, error } = await admin.auth.admin.createUser({ email, password: pin, email_confirm: true })
  if (error) throw error

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: data.user.id, nickname, nickname_key: nicknameKey })
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    // tú istú prezývku si medzitým vybral niekto iný
    if (profileError.code === '23505') return { error: 'nickname_taken' }
    throw profileError
  }

  const result = await passwordSignIn(email, pin)
  if (result === 'wrong_pin') throw new Error('Nový účet sa nepodarilo prihlásiť')
  return { ok: true, session: result }
}

async function passwordSignIn(email: string, pin: string) {
  const client = createClient(url, publishableKey, noSession)
  const { data, error } = await client.auth.signInWithPassword({ email, password: pin })
  if (error?.code === 'invalid_credentials') return 'wrong_pin'
  if (error) throw error
  const session: Session = data.session
  return { access_token: session.access_token, refresh_token: session.refresh_token }
}

// ---------- Blokovanie po nesprávnych pokusoch ----------

async function getAttempts(key: string) {
  const { data, error } = await admin.from('failed_attempts').select('count, blocked_until').eq('key', key).maybeSingle()
  if (error) throw error
  const blockedUntil = data?.blocked_until ? new Date(data.blocked_until) : null
  if (blockedUntil && blockedUntil > new Date()) return { count: 0, blockedUntil }
  return { count: blockedUntil ? 0 : (data?.count ?? 0), blockedUntil: null }
}

async function failedAttempt(key: string, previousCount: number, error: string): Promise<Reply> {
  const count = previousCount + 1
  const blockedUntil = count >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_MINUTES * 60_000) : null
  const { error: saveError } = await admin
    .from('failed_attempts')
    .upsert({ key, count: blockedUntil ? 0 : count, blocked_until: blockedUntil?.toISOString() ?? null })
  if (saveError) throw saveError
  return blockedUntil ? blocked(blockedUntil) : { error, attemptsLeft: MAX_ATTEMPTS - count }
}

async function clearAttempts(key: string) {
  const { error } = await admin.from('failed_attempts').delete().eq('key', key)
  if (error) throw error
}

function blocked(until: Date): Reply {
  return { error: 'blocked', minutes: Math.ceil((until.getTime() - Date.now()) / 60_000) }
}
