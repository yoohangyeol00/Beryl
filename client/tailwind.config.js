/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f6faf8',
        'surface-dim': '#d7dbd9',
        'surface-bright': '#f6faf8',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f4f2',
        'surface-container': '#ebefed',
        'surface-container-high': '#e5e9e7',
        'surface-container-highest': '#dfe3e1',
        'on-surface': '#181d1c',
        'on-surface-variant': '#3d4a41',
        'inverse-surface': '#2d3130',
        'inverse-on-surface': '#eef2f0',
        outline: '#6d7a70',
        'outline-variant': '#bccabe',
        'surface-tint': '#006d43',
        primary: '#006d43',
        'on-primary': '#ffffff',
        'primary-container': '#00a86b',
        'on-primary-container': '#00331d',
        'inverse-primary': '#59de9b',
        secondary: '#2a6865',
        'on-secondary': '#ffffff',
        'secondary-container': '#b1eeea',
        'on-secondary-container': '#316e6b',
        tertiary: '#006c52',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#00a782',
        'on-tertiary-container': '#003326',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        background: '#f6faf8',
        'on-background': '#181d1c'
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        unit: '8px',
        'container-max': '1280px',
        gutter: '24px',
        'margin-desktop': '48px',
        'margin-mobile': '16px'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Work Sans', 'Noto Sans KR', 'sans-serif'],
        label: ['IBM Plex Sans', 'Noto Sans KR', 'sans-serif']
      },
      fontSize: {
        'headline-xl': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }]
      },
      boxShadow: {
        ambient: '0 8px 24px rgba(0, 36, 27, 0.08)'
      }
    }
  },
  plugins: []
};
