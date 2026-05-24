
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/globals.css'
import App from './App.tsx'
import { Toaster } from "@/components/ui/toaster"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="antialiased bg-background text-foreground">
      <App />
      <Toaster />
    </div>
  </StrictMode>,
)
