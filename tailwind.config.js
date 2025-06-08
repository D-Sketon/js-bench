/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'mono': ['"Fira Code"', '"JetBrains Mono"', '"Source Code Pro"', '"SF Mono"', 'Monaco', 'Consolas', '"Ubuntu Mono"', 'monospace']
      },
      colors: {
        dark: {
          bg: {
            primary: '#0d1117',
            secondary: '#161b22',
            tertiary: '#21262d',
            elevated: '#1c2128',
          },
          text: {
            primary: '#e6edf3',
            secondary: '#7d8590', 
            muted: '#656d76',
          },
          border: {
            primary: '#21262d',
            secondary: '#30363d',
            muted: '#373e47',
          },
          accent: {
            blue: '#1f6feb',
            green: '#238636',
            orange: '#da7633',
            red: '#da3633',
            purple: '#8957e5',
          }
        }
      }
    },
  },
  plugins: [],
} 