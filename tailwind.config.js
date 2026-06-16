/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        kenburns: {
          from: { transform: 'scale(1.12)' },
          to: { transform: 'scale(1)' },
        },
      },
      animation: {
        kenburns: 'kenburns 1.8s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  // The project ships its own global reset + custom CSS, so we keep Tailwind's
  // preflight off to avoid resetting/altering the existing design.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
