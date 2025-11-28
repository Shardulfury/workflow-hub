/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Custom Glass & Glow Colors
                glass: {
                    100: "rgba(255, 255, 255, 0.1)",
                    200: "rgba(255, 255, 255, 0.2)",
                    300: "rgba(255, 255, 255, 0.3)",
                },
                neon: {
                    blue: "#00f3ff",
                    purple: "#bc13fe",
                    pink: "#ff00aa",
                }
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 10px rgba(0, 243, 255, 0.5)" },
                    "50%": { boxShadow: "0 0 20px rgba(0, 243, 255, 0.8)" },
                }
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-out forwards",
                "slide-up": "slide-up 0.6s ease-out forwards",
                "pulse-glow": "pulse-glow 2s infinite",
            },
            boxShadow: {
                "glow": "0 0 15px rgba(0, 243, 255, 0.3)",
                "glow-lg": "0 0 30px rgba(188, 19, 254, 0.4)",
            }
        }
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
