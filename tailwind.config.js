/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebaff',
          400: '#5894ff',
          500: '#3b78f5',
          600: '#0058f5',
          700: '#0044cc',
          800: '#003a97',
          900: '#002a6e'
        },
        lake: '#58d4ff',
        energy: '#ffc52c'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,58,151,0.04), 0 1px 3px 0 rgba(0,58,151,0.06)',
        cardHover: '0 4px 16px 0 rgba(0,58,151,0.1)',
        raised: '0 8px 24px 0 rgba(0,58,151,0.14)'
      }
    }
  },
  plugins: []
}
