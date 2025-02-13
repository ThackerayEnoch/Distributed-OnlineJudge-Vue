/** @type {import('tailwindcss').Config} */
import tailwindcssPrimeui from 'tailwindcss-primeui';
import typography from '@tailwindcss/typography';
export default {
    darkMode: ['selector', '[class*="app-dark"]'],
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [
        typography,
        tailwindcssPrimeui
    ],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        }
    }
};