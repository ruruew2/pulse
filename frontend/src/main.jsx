import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. 길잡이 불러오기
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. App을 BrowserRouter로 감싸줍니다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)