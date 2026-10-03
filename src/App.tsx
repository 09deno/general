import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import InstallGuide from './components/InstallGuide'
import Screen from './components/Screen'
import { tabs } from './tabs'

export default function App() {
  return (
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
      <InstallGuide />
    </div>
  )
}
