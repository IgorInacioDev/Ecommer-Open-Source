/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Personalize a cor red-600 aqui
        red: {
          600: '#E7002A', // Cor padrão do Tailwind
          // Para trocar, substitua por sua cor desejada:
          // 600: '#ff0000', // Exemplo: vermelho puro
          // 600: '#b91c1c', // Exemplo: vermelho mais escuro
          // 600: '#ef4444', // Exemplo: vermelho mais claro
        },
      },
      fontFamily: {
        // Fontes principais
        'syne': ['var(--font-geist-syne)', 'Syne', 'sans-serif'],
        'barlow': ['var(--font-geist-barlow)', 'Barlow', 'sans-serif'],
        'montserrat': ['var(--font-geist-montserrat)', 'Montserrat', 'sans-serif'],
        'gotham': ['Gotham Condensed Bold', 'sans-serif'],
        
        // Aliases para compatibilidade
        'primary': ['var(--font-geist-syne)', 'Syne', 'sans-serif'],
        'secondary': ['var(--font-geist-barlow)', 'Barlow', 'sans-serif'],
        'tertiary': ['var(--font-geist-montserrat)', 'Montserrat', 'sans-serif'],
        'geist-syne': ['var(--font-geist-syne)', 'Syne', 'sans-serif'],
        'geist-barlow': ['var(--font-geist-barlow)', 'Barlow', 'sans-serif'],
        'geist-montserrat': ['var(--font-geist-montserrat)', 'Montserrat', 'sans-serif'],
        
        // Sans padrão sem fonte específica
        'sans': ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}