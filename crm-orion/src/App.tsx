import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CRMProvider } from './context/CRMContext'
import { SettingsProvider } from './context/SettingsContext'
import { Layout } from './Layout'

const Dashboard    = React.lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const CRM          = React.lazy(() => import('./features/crm/CRM').then(m => ({ default: m.CRM })))
const Construction = React.lazy(() => import('./features/construction/Construction').then(m => ({ default: m.Construction })))
const Agenda       = React.lazy(() => import('./features/agenda/Agenda').then(m => ({ default: m.Agenda })))
const SettingsView = React.lazy(() => import('./features/settings/SettingsView').then(m => ({ default: m.SettingsView })))

export default function App() {
  return (
    <SettingsProvider>
      <CRMProvider>
        <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index              element={<Dashboard />} />
              <Route path="crm"         element={<CRM />} />
              <Route path="obras"       element={<Construction />} />
              <Route path="agenda"      element={<Agenda />} />
              <Route path="settings"    element={<SettingsView />} />
            </Route>
          </Routes>
        </Suspense>
      </CRMProvider>
    </SettingsProvider>
  )
}
