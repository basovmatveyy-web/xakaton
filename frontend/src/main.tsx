import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import vkBridge from '@vkontakte/vk-bridge'
import './index.css'
import App from './App.tsx'

// Обязательная инициализация VK Mini App для платформы VK / Сферум
try {
  vkBridge.send('VKWebAppInit').catch((err) => {
    console.log('VKWebAppInit running in standalone/browser mode:', err);
  });
} catch (err) {
  console.log('VKWebAppInit safe ignore:', err);
}

// Инициализация MAX WebApp для платформы мессенджера MAX
if (typeof window !== 'undefined' && (window as any).WebApp) {
  try {
    (window as any).WebApp.ready();
    (window as any).WebApp.expand();
  } catch (e) {
    console.info('MAX WebApp init notice:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
