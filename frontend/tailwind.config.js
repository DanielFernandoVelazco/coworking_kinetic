// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Modo claro
                primary: '#a03f28',
                'primary-dark': '#c0573e',
                secondary: '#c0573e',
                'secondary-dark': '#d46b50',
                'on-primary': '#ffffff',
                'on-dark-primary': '#ffffff',

                // Superficies
                surface: '#fbf8fc',
                'surface-dark': '#121212',
                'surface-container-low': '#f5f3f6',
                'surface-container-lowest': '#ffffff',
                'surface-container-high': '#ede8ea',
                'surface-dark-container-low': '#1e1e1e',
                'surface-dark-container-lowest': '#121212',
                'surface-dark-container-high': '#2a2a2a',

                // Textos
                'on-surface': '#1b1b1e',
                'on-dark-surface': '#e8e4e6',
                'on-surface-variant': '#56423d',
                'on-dark-surface-variant': '#b0a09b',

                // Bordes
                'outline-variant': '#ddc0ba',
                'outline-dark-variant': '#3d2e2a',

                // Fondos
                background: '#fbf8fc',
                'dark-background': '#121212',
            },
            fontFamily: {
                manrope: ['Manrope', 'sans-serif'],
                'work-sans': ['Work Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'display-xl': ['64px', { lineHeight: '72px' }],
                'headline-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em' }],
                'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
                'headline-sm': ['20px', { lineHeight: '28px' }],
                'body-lg': ['18px', { lineHeight: '28px' }],
                'body-md': ['16px', { lineHeight: '24px' }],
                'body-sm': ['14px', { lineHeight: '20px' }],
                'body-xs': ['12px', { lineHeight: '16px' }],
                'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],
            },
            spacing: {
                'margin-desktop': '40px',
                'margin-mobile': '16px',
                'gutter': '24px',
            },
            maxWidth: {
                'container-max': '1200px',
            },
            zIndex: {
                '100': '100',
            },
        },
    },
    plugins: [],
}