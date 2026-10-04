import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import './util/toast'
import App from './App.jsx'

if (import.meta.env.DEV && !import.meta.env.VITE_RAZORPAY_KEY_ID) {
  console.warn(
    "[Razorpay Warning] VITE_RAZORPAY_KEY_ID is missing from environment variables. " +
    "Please add VITE_RAZORPAY_KEY_ID=rzp_test_... to Frontend/.env.local to enable checkout."
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </StrictMode>,
)
