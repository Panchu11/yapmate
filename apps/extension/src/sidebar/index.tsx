import React from 'react'
import ReactDOM from 'react-dom/client'
import SidebarApp from './SidebarApp'
import '../styles/globals.css'

const root = ReactDOM.createRoot(
  document.getElementById('sidebar-root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <SidebarApp />
  </React.StrictMode>
)
