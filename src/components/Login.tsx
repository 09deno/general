import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { callLogin, errorMessage, NICKNAME, type LoginRequest } from '../lib/login'
import { supabase } from '../lib/supabase'
import PinPad from './PinPad'

type Step = 'code' | 'nickname' | 'pin' | 'pin-again'

// Registrácia aj prihlásenie jedným postupom: pozývací kód → prezývka → PIN.
// Známu prezývku stačí potvrdiť PIN-om, nová si PIN vyberie a zopakuje.
export default function Login() {
  const [step, setStep] = useState<Step>('code')
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // po nesprávnom PIN-e sa bodky vymažú (PinPad sa vykreslí nanovo)
  const [pinRound, setPinRound] = useState(0)

  const goTo = (next: Step) => {
    setError('')
    setStep(next)
  }

  const back = () => goTo(step === 'pin-again' ? 'pin' : step === 'pin' ? 'nickname' : 'code')

  async function send(request: LoginRequest) {
    setBusy(true)
    setError('')
    const reply = await callLogin(request)
    setBusy(false)
    if (reply.error) setError(errorMessage(reply))
    return reply.error ? null : reply
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault()
    if (await send({ step: 'code', code })) goTo('nickname')
  }

  async function submitNickname(event: FormEvent) {
    event.preventDefault()
    const value = nickname.trim().normalize('NFC')
    if (!NICKNAME.test(value)) {
      setError(errorMessage({ error: 'invalid_nickname' }))
      return
    }
    const reply = await send({ step: 'nickname', code, nickname: value })
    if (!reply) return
    setNickname(reply.nickname ?? value)
    setIsNew(!reply.exists)
    goTo('pin')
  }

  async function submitPin(pin: string) {
    if (isNew && step === 'pin') {
      setFirstPin(pin)
      goTo('pin-again')
      return
    }
    if (isNew && pin !== firstPin) {
      setStep('pin')
      setError('PIN-y sa nezhodujú. Vyber si PIN znova.')
      return
    }

    setBusy(true)
    setError('')
    const reply = await callLogin({ step: 'pin', code, nickname, pin, isNew })
    if (reply.session) {
      const { error: sessionError } = await supabase.auth.setSession(reply.session)
      // prihlásený – appka sa sama prepne na hlavnú obrazovku
      if (!sessionError) return
    }
    setBusy(false)
    setError(errorMessage(reply))
    setPinRound((round) => round + 1)
    if (reply.error === 'nickname_taken') setStep('nickname')
  }

  const message = error ? (
    <p className="login__message login__message--error" role="alert">
      {error}
    </p>
  ) : (
    <p className="login__message" aria-live="polite">
      {busy ? 'Overujem…' : ''}
    </p>
  )

  return (
    <div className="login">
      <header>
        {step === 'code' ? (
          <img className="login__icon" src="/icons/icon-192.png" alt="" width={56} height={56} />
        ) : (
          <button type="button" className="login__back" onClick={back} disabled={busy} aria-label="Späť">
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
        )}
        <Heading step={step} nickname={nickname} isNew={isNew} />
      </header>

      {step === 'code' && (
        <form className="login__form" onSubmit={submitCode}>
          <input
            className="field"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Pozývací kód"
            aria-label="Pozývací kód"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          {message}
          <button type="submit" className="button button--primary" disabled={busy || !code.trim()}>
            Pokračovať
          </button>
        </form>
      )}

      {step === 'nickname' && (
        <form className="login__form" onSubmit={submitNickname}>
          <input
            className="field"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Prezývka"
            aria-label="Prezývka"
            maxLength={20}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus
          />
          <p className="login__hint">3 až 20 znakov – písmená, čísla a podčiarkovník.</p>
          {message}
          <button type="submit" className="button button--primary" disabled={busy || !nickname.trim()}>
            Pokračovať
          </button>
        </form>
      )}

      {(step === 'pin' || step === 'pin-again') && (
        <PinPad key={`${step}-${pinRound}`} disabled={busy} onComplete={submitPin}>
          {message}
        </PinPad>
      )}
    </div>
  )
}

function Heading({ step, nickname, isNew }: { step: Step; nickname: string; isNew: boolean }) {
  if (step === 'code') {
    return (
      <>
        <h1 className="login__title">Vitaj vo Fit denníku</h1>
        <p className="login__lead">Zadaj pozývací kód, ktorý si dostal od kamaráta.</p>
      </>
    )
  }
  if (step === 'nickname') {
    return (
      <>
        <h1 className="login__title">Tvoja prezývka</h1>
        <p className="login__lead">Ak už účet máš, zadaj svoju prezývku. Ak ešte nie, vyber si novú.</p>
      </>
    )
  }
  if (step === 'pin-again') {
    return (
      <>
        <h1 className="login__title">Zopakuj PIN</h1>
        <p className="login__lead">Pre istotu ho zadaj ešte raz.</p>
      </>
    )
  }
  if (isNew) {
    return (
      <>
        <h1 className="login__title">Vyber si PIN</h1>
        <p className="login__lead">
          Prezývka <b>{nickname}</b> je voľná. Zvoľ si 6 číslic – budeš ich potrebovať pri prihlásení na
          novom telefóne.
        </p>
      </>
    )
  }
  return (
    <>
      <h1 className="login__title">Ahoj, {nickname}!</h1>
      <p className="login__lead">Zadaj svoj PIN.</p>
    </>
  )
}
