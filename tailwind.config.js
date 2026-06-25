/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "medical-teal": "#1A939E",
                "primary": "#00666e",
                "primary-container": "#00818b",
                "background": "#F4F7F9",
                "surface": "#FFFFFF",
                "surface-container-low": "#f0f4f5",
                "surface-container": "#eaefef",
                "surface-container-high": "#e5e9e9",
                "surface-container-lowest": "#ffffff",
                "outline": "#6d797b",
                "outline-variant": "#bdc9ca",
                "charcoal": "#2D3436",
                "on-surface": "#171c1d",
                "on-surface-variant": "#3d494a",
                "alert-red": "#E71D36",
                "signal-green": "#2ECC71",
                "brand-red": "#E60000",
                "brand-navy": "#001F54"
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                "mono-data": ["monospace"]
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries')
    ],
}