/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./types.ts",
    ],
    theme: {
        extend: {
            colors: {
                executive: {
                    neutral: {
                        50: '#FAFAF8',
                        100: '#F5F5F3',
                        200: '#E8E8E5',
                        300: '#D1D1CC',
                        400: '#9E9E96',
                        500: '#6B6B63',
                        600: '#4A4A44',
                        700: '#2D2D29',
                        800: '#1A1A17',
                        900: '#0D0D0B',
                    },
                    gold: {
                        400: '#D4AF6A',
                        500: '#C0A76A',
                        600: '#A68F54',
                    },
                },
                status: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                },
                stage: {
                    nouveau: '#94A3B8',
                    contacte: '#60A5FA',
                    qualifie: '#3B82F6',
                    proposition: '#8B5CF6',
                    negociation: '#F59E0B',
                    gagne: '#10B981',
                    perdu: '#6B7280',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}