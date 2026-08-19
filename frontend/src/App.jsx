// frontend/src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from './components/common/ThemeToggle';

function App() {
  return (
    // ✅ ThemeProvider debe ser el más externo
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
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
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;