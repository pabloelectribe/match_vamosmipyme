/** Tokens de la Guía gráfica BancoEstado 2026 (+ ajustes de contraste AA documentados en el README). */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        naranjo: { DEFAULT: '#ff7900', oscuro: '#e06b00', texto: '#b34f00', suave: '#fff0e0', tinta: '#8a3f00' },
        azul: { DEFAULT: '#004dff', suave: '#e6edff' },
        gris: { DEFAULT: '#343e46', medio: '#5b6770', borde: '#dfe3e6', claro: '#f5f5f5' },
        tinta: '#1b2227',
      },
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: { tarjeta: '0 1px 2px rgba(52,62,70,.06), 0 8px 24px rgba(52,62,70,.08)' },
    },
  },
  plugins: [],
}
