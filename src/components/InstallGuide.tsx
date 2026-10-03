import { useEffect, useState } from 'react'
import { Ellipsis, EllipsisVertical, Share, SquarePlus } from 'lucide-react'

type Platform = 'ios' | 'android' | 'other'

// Udalosť, ktorou Chrome na Androide ponúka inštaláciu appky.
type InstallPromptEvent = Event & { prompt: () => Promise<void> }

const DISMISS_KEY = 'install-guide-dismissed'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  // iPad sa v Safari hlási ako Mac, prezradí ho dotyková obrazovka
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

// Návod na pridanie appky na plochu. Ukáže sa len na mobile, keď je appka otvorená v prehliadači.
export default function InstallGuide() {
  const [platform] = useState(detectPlatform)
  const [open, setOpen] = useState(() => platform !== 'other' && !isInstalled() && !wasDismissed())
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => setOpen(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // stránka pod návodom sa nemá posúvať
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // bez úložiska sa návod ukáže znova pri ďalšom otvorení, nič sa nedeje
    }
    setOpen(false)
  }

  return (
    <div className="install" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <div>
        <img className="install__icon" src="/icons/icon-192.png" alt="" width={64} height={64} />
        <h1 id="install-title" className="install__title">
          Pridaj si Fit denník na plochu
        </h1>
        <p className="install__lead">
          Bude sa otvárať ako normálna appka – na celú obrazovku, bez lišty prehliadača.
        </p>

        {platform === 'ios' && <IosSteps />}
        {platform === 'android' && !installEvent && <AndroidSteps />}
      </div>

      <div className="install__actions">
        {installEvent && (
          <button type="button" className="button button--primary" onClick={() => installEvent.prompt()}>
            Nainštalovať appku
          </button>
        )}
        <button type="button" className="button button--ghost" onClick={dismiss}>
          Pokračovať v prehliadači
        </button>
      </div>
    </div>
  )
}

function IosSteps() {
  return (
    <>
      <ol className="steps">
        <li>
          <span>
            Ťukni na <Ellipsis className="steps__icon" aria-label="tri bodky" /> vpravo dole a vyber{' '}
            <b>Zdieľať</b> <Share className="steps__icon" aria-hidden="true" />
            <small className="steps__hint">Na starších iPhonoch je Zdieľať priamo v dolnej lište.</small>
          </span>
        </li>
        <li>
          <span>
            Posuň nižšie a ťukni na <b>Pridať na plochu</b>{' '}
            <SquarePlus className="steps__icon" aria-hidden="true" />
          </span>
        </li>
        <li>
          <span>
            Potvrď ťuknutím na <b>Pridať</b> vpravo hore.
          </span>
        </li>
      </ol>
      <p className="install__note">
        Ak sa odkaz otvoril v Messengeri alebo Instagrame, otvor ho najprv v Safari – odtiaľ sa appka na
        plochu pridať nedá.
      </p>
    </>
  )
}

function AndroidSteps() {
  return (
    <ol className="steps">
      <li>
        <span>
          Ťukni na <EllipsisVertical className="steps__icon" aria-label="tri bodky" /> vpravo hore.
        </span>
      </li>
      <li>
        <span>
          Vyber <b>Pridať na plochu</b> alebo <b>Inštalovať aplikáciu</b>.
        </span>
      </li>
      <li>
        <span>
          Potvrď ťuknutím na <b>Inštalovať</b>.
        </span>
      </li>
    </ol>
  )
}
