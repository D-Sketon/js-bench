/** @type {import('tailwindcss').Config} */
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
        // 自定义深色主题颜色
        dark: {
          bg: {
            primary: '#0d1117',    // 主背景 - GitHub深色
            secondary: '#161b22',  // 次要背景
            tertiary: '#21262d',   // 第三级背景
            elevated: '#1c2128',   // 提升的背景
          },
          text: {
            primary: '#e6edf3',    // 主要文字
            secondary: '#7d8590',  // 次要文字
            muted: '#656d76',      // 静音文字
          },
          border: {
            primary: '#21262d',    // 主要边框
            secondary: '#30363d',  // 次要边框
            muted: '#373e47',      // 静音边框
          },
          accent: {
            blue: '#1f6feb',       // 蓝色强调
            green: '#238636',      // 绿色强调
            orange: '#da7633',     // 橙色强调
            red: '#da3633',        // 红色强调
            purple: '#8957e5',     // 紫色强调
          }
        }
      }
    },
  },
  plugins: [],
} 