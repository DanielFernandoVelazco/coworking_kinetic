import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1b1b1e',
            color: '#fbf8fc',
            borderRadius: '0.5rem',
          },
          success: {
            style: {
              background: '#a03f28',
            },
          },
          error: {
            style: {
              background: '#ba1a1a',
            },
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;