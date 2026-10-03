import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import InstallGuide from './components/InstallGuide'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import Screen from './components/Screen'
import Settings from './components/Settings'
import { useGoals } from './lib/useGoals'
import { useSession } from './lib/useSession'
import { tabs } from './tabs'

export default function App() {
  const session = useSession()

  // kým appka nezistí, či je niekto prihlásený (zlomok sekundy), nič nekreslí
  if (session === undefined) return null

  return (
    <>
      {session ? <SignedIn userId={session.user.id} /> : <Login />}
      <InstallGuide />
    </>
  )
}

function SignedIn({ userId }: { userId: string }) {
  const { goals, failed, retry, setGoals } = useGoals(userId)
  const [changingGoals, setChangingGoals] = useState(false)

  if (failed) return <LoadError onRetry={retry} />
  if (goals === undefined) return null
  if (goals === null) return <Onboarding userId={userId} onDone={setGoals} />
  if (changingGoals) {
    return (
      <Onboarding
        userId={userId}
        initial={goals}
        onCancel={() => setChangingGoals(false)}
        onDone={(saved) => {
          setGoals(saved)
          setChangingGoals(false)
        }}
      />
    )
  }

  return (
    <div className="app">
      <main className="app__content">
        <Routes>
          {tabs.map((tab) => (
            <Route
              key={tab.path}
              path={tab.path}
              element={
                tab.path === '/nastavenia' ? (
                  <Settings goals={goals} onChangeGoals={() => setChangingGoals(true)} />
                ) : (
                  <Screen title={tab.label} description={tab.description} />
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/jedlo" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flow">
      <header>
        <h1 className="flow__title">Nepodarilo sa načítať tvoje údaje</h1>
        <p className="flow__lead">Skontroluj internet a skús to znova.</p>
      </header>
      <button type="button" className="button button--primary" onClick={onRetry}>
        Skúsiť znova
      </button>
    </div>
  )
}
