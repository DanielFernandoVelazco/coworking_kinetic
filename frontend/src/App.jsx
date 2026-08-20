// frontend/src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from './components/common/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AlertProvider>
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
            <ThemeToggle />
          </AlertProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;