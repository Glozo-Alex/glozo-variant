import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: [
					'Inter', 
					'-apple-system', 
					'BlinkMacSystemFont', 
					'Segoe UI', 
					'Roboto', 
					'Helvetica Neue', 
					'Arial', 
					'sans-serif'
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				'input-border': 'hsl(var(--input-border))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					glow: 'hsl(var(--primary-glow))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					glow: 'hsl(var(--destructive-glow))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))',
					shadow: 'hsl(var(--card-shadow))',
					hover: 'hsl(var(--card-hover))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				sidebar: {
					bg: 'hsl(var(--sidebar-bg))',
					border: 'hsl(var(--sidebar-border))',
					text: 'hsl(var(--sidebar-text))',
					'text-active': 'hsl(var(--sidebar-text-active))',
					hover: 'hsl(var(--sidebar-hover))',
					accent: 'hsl(var(--sidebar-accent))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					glow: 'hsl(var(--success-glow))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					glow: 'hsl(var(--warning-glow))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				glass: {
					DEFAULT: 'hsl(var(--glass))',
					border: 'hsl(var(--glass-border))',
					shadow: 'hsl(var(--glass-shadow))'
				},
				'match-excellent': 'hsl(var(--match-excellent))',
				'match-good': 'hsl(var(--match-good))',
				'match-fair': 'hsl(var(--match-fair))',
				'match-poor': 'hsl(var(--match-poor))',
				'tag-blue': 'hsl(var(--tag-blue))',
				'tag-blue-text': 'hsl(var(--tag-blue-text))',
				'tag-blue-glow': 'hsl(var(--tag-blue-glow))',
				'tag-purple': 'hsl(var(--tag-purple))',
				'tag-purple-text': 'hsl(var(--tag-purple-text))',
				'tag-purple-glow': 'hsl(var(--tag-purple-glow))',
				'tag-green': 'hsl(var(--tag-green))',
				'tag-green-text': 'hsl(var(--tag-green-text))',
				'tag-green-glow': 'hsl(var(--tag-green-glow))'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'elegant': 'var(--shadow-lg)',
				'glass': 'var(--shadow-md)',
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-sidebar': 'var(--gradient-sidebar)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
