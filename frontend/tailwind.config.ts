import type { Config } from 'tailwindcss';

// VoiceBox — high-contrast editorial. Black/white foundation, one red accent,
// sharp 0px corners, flat (no shadows), thick borders do the structural work.
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        paper: '#FAFAFA',
        surface: '#F5F5F5',
        raised: '#E5E5E5',
        muted: '#525252',
        faint: '#A3A3A3',
        accent: {
          DEFAULT: '#EF4444',
          active: '#DC2626',
          deep: '#B91C1C',
        },
        line: {
          subtle: '#E5E5E5',
          medium: '#D4D4D4',
          strong: '#0A0A0A',
        },
        success: '#16A34A',
        warning: '#CA8A04',
      },
      fontFamily: {
        display: ['var(--font-archivo)'],
        sans: ['var(--font-work-sans)'],
        mono: ['var(--font-space-mono)'],
      },
      letterSpacing: {
        overline: '0.12em',
        label: '0.06em',
      },
      borderRadius: {
        none: '0',
        full: '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
