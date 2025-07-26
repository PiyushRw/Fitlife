/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-[#121212]', 'bg-[#1E1E1E]', 'bg-[#62E0A1]', 'bg-[#36CFFF]', 'bg-[#24d0a4]', 'bg-[#f4aa3c]', 'bg-[#F2B33D]',
    'text-[#121212]', 'text-[#1E1E1E]', 'text-[#62E0A1]', 'text-[#36CFFF]', 'text-[#24d0a4]', 'text-[#f4aa3c]', 'text-[#F2B33D]',
    'border-[#121212]', 'border-[#1E1E1E]', 'border-[#62E0A1]', 'border-[#36CFFF]', 'border-[#24d0a4]', 'border-[#f4aa3c]', 'border-[#F2B33D]',
    'from-[#62E0A1]', 'to-[#36CFFF]', 'from-[#24d0a4]', 'to-[#36CFFF]', 'from-[#f4aa3c]', 'to-[#F2B33D]',
    'hover:bg-[#62E0A1]', 'hover:bg-[#36CFFF]', 'hover:bg-[#24d0a4]', 'hover:bg-[#f4aa3c]', 'hover:bg-[#F2B33D]',
    'hover:text-[#2fd1c0]'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
