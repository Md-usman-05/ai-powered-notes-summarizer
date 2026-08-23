import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/poppins'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import "sweetalert2/dist/sweetalert2.min.css";
import './styles/global.css'
import './styles/account.css'
import './styles/redesign.css'
import './styles/simple-ui.css'
import './styles/experience.css'
import './styles/history-grid.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
