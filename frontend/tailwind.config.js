/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#a03f28',
                'primary-container': '#c0573e',
                'primary-fixed': '#ffdad2',
                'primary-fixed-dim': '#ffb4a3',
                'on-primary': '#ffffff',
                'on-primary-container': '#120100',
                'on-primary-fixed': '#3d0700',
                'on-primary-fixed-variant': '#812914',

                secondary: '#904d00',
                'secondary-container': '#fe932c',
                'secondary-fixed': '#ffdcc3',
                'secondary-fixed-dim': '#ffb77d',
                'on-secondary': '#ffffff',
                'on-secondary-container': '#663500',
                'on-secondary-fixed': '#2f1500',
                'on-secondary-fixed-variant': '#6e3900',

                tertiary: '#934a23',
                'tertiary-container': '#b26138',
                'tertiary-fixed': '#ffdbcc',
                'tertiary-fixed-dim': '#ffb693',
                'on-tertiary': '#ffffff',
                'on-tertiary-container': '#ffffff',
                'on-tertiary-fixed': '#351000',
                'on-tertiary-fixed-variant': '#76330d',

                error: '#ba1a1a',
                'error-container': '#ffdad6',
                'on-error': '#ffffff',
                'on-error-container': '#93000a',

                surface: '#fbf8fc',
                'surface-dim': '#dcd9dd',
                'surface-bright': '#fbf8fc',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#f5f3f6',
                'surface-container': '#f0edf1',
                'surface-container-high': '#eae7eb',
                'surface-container-highest': '#e4e1e5',
                'on-surface': '#1b1b1e',
                'on-surface-variant': '#56423d',

                'inverse-surface': '#303033',
                'inverse-on-surface': '#f3f0f4',
                'inverse-primary': '#ffb4a3',

                outline: '#8a726c',
                'outline-variant': '#ddc0ba',
                background: '#fbf8fc',
                'surface-tint': '#a03f29',
            },
            fontFamily: {
                'label-caps': ['JetBrains Mono', 'monospace'],
                'headline-lg': ['Manrope', 'sans-serif'],
                'body-lg': ['Work Sans', 'sans-serif'],
                'headline-md': ['Manrope', 'sans-serif'],
                'body-md': ['Work Sans', 'sans-serif'],
                'body-sm': ['Work Sans', 'sans-serif'],
                'display-xl': ['Manrope', 'sans-serif'],
            },
            fontSize: {
                'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
                'headline-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '700' }],
                'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
                'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
                'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'display-xl': ['60px', { lineHeight: '72px', letterSpacing: '-0.02em', fontWeight: '800' }],
            },
            spacing: {
                'gutter': '24px',
                'margin-tablet': '32px',
                'margin-mobile': '16px',
                'container-max': '1440px',
                'margin-desktop': '64px',
                'base': '8px'
            },
            borderRadius: {
                'DEFAULT': '0.125rem',
                'lg': '0.25rem',
                'xl': '0.5rem',
                'full': '0.75rem'
            }
        },
    },
    plugins: [],
}