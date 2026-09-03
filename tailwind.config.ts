import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fundo: 'var(--fundo)',
        superficie: 'var(--superficie)',
        superficie2: 'var(--superficie-2)',
        texto: 'var(--texto)',
        suave: 'var(--texto-suave)',
        fraco: 'var(--texto-fraco)',
        linha: 'var(--linha)',
        acento: 'var(--acento)',
        feito: 'var(--feito)',
      },
      fontFamily: {
        display: ['var(--fonte-display)', 'system-ui', 'sans-serif'],
        corpo: ['var(--fonte-corpo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
