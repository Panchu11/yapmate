import React from 'react'
import ReactDOM from 'react-dom/client'
import PopupApp from './PopupApp'
import '../styles/globals.css'

const root = ReactDOM.createRoot(
  document.getElementById('popup-root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
)
