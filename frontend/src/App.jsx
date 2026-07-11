// src/App.jsx
import React from 'react'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './AppRoutes'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  )
}

export default App