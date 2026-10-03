import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import InstallGuide from './components/InstallGuide'
import Login from './components/Login'
import Screen from './components/Screen'
import { useSession } from './lib/useSession'
import { tabs } from './tabs'

export default function App() {
  const session = useSession()

  // kým appka nezistí, či je niekto prihlásený (zlomok sekundy), nič nekreslí
  if (session === undefined) return null

  return (
    <>
      {session ? (
        <div className="app">
          <main className="app__content">
            <Routes>
              {tabs.map((tab) => (
                <Route
                  key={tab.path}
                  path={tab.path}
                  element={<Screen title={tab.label} description={tab.description} />}
                />
              ))}
              <Route path="*" element={<Navigate to="/jedlo" replace />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      ) : (
        <Login />
      )}
      <InstallGuide />
    </>
  )
}
