/** @type {import('tailwindcss').Config} */
module.exports = {
  // expo-router 의 app/ + 모든 src/ 코드 안의 className 을 스캔
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
