/** @type {import('tailwindcss').Config} */
module.exports = {
  // expo-router 의 app/ + 모든 src/ 코드 안의 className 을 스캔
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // 천일식당 브랜드 그린 — Next 프로젝트 (src/style/preset.ts) 와 동일 팔레트.
      // 기준값 #4FB395 (primary-500).
      colors: {
        primary: {
          50: '#E9F5EF',
          100: '#C9E8D6',
          200: '#A6D7B8',
          300: '#82C79A',
          400: '#67BC89',
          500: '#4FB395',
          600: '#3F9478',
          700: '#2F755C',
          800: '#1F5641',
          900: '#144432',
          950: '#0A2A1F',
        },
      },
    },
  },
  plugins: [],
};
