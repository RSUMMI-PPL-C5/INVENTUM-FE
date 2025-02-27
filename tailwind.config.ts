import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
          'background': '#FAFDFF',
          'primary': {
            'solid': '#203268',
            'light': '#8F98B3',
            'super-light': '#C5CAD8', 
          },
          'secondary': {
            'solid': '#56C5F1',
            'light': '#AAE2F8',
            'super-light': '#DDF3FC',
          },
          'accent': {
            'danger': '#DA5249',
            'warning': '#DA933D',
          },
        },
        fontFamily: {
          'ag': ['Ag', 'sans-serif'], 
        },
        fontSize: {
          // Headers
          'header-h1': ['64px', { lineHeight: '90px', fontWeight: '900' }],
          'header-h2': ['56px', { lineHeight: '72px', fontWeight: '800' }],
          'header-h3': ['48px', { lineHeight: '68px', fontWeight: '800' }],
          'header-h4': ['40px', { lineHeight: '56px', fontWeight: '800' }],
          'header-h5': ['36px', { lineHeight: '50px', fontWeight: '800' }],
          'header-h6': ['32px', { lineHeight: '44px', fontWeight: '800' }],
  
          // Subheadings
          'subheading-1-black': ['32px', { lineHeight: '44px', fontWeight: '900' }],
          'subheading-1-extrabold': ['32px', { lineHeight: '44px', fontWeight: '800' }],
          'subheading-1-bold': ['32px', { lineHeight: '44px', fontWeight: '700' }],
          'subheading-1-semibold': ['32px', { lineHeight: '44px', fontWeight: '600' }],
          'subheading-1-medium': ['32px', { lineHeight: '44px', fontWeight: '500' }],
  
          // XXL
          'xxl-extrabold': ['24px', { lineHeight: '140%', fontWeight: '800' }],
          'xxl-bold': ['24px', { lineHeight: '140%', fontWeight: '700' }],
          'xxl-semibold': ['24px', { lineHeight: '140%', fontWeight: '600' }],
          'xxl-medium': ['24px', { lineHeight: '140%', fontWeight: '500' }],
  
          // XL
          'xl-extrabold': ['20px', { lineHeight: '140%', fontWeight: '800' }],
          'xl-bold': ['20px', { lineHeight: 'auto', fontWeight: '700' }],
          'xl-semibold': ['20px', { lineHeight: 'auto', fontWeight: '600' }],
          'xl-medium': ['20px', { lineHeight: 'auto', fontWeight: '500' }],
  
          // L
          'l-extrabold': ['18px', { lineHeight: 'auto', fontWeight: '800' }],
          'l-bold': ['18px', { lineHeight: 'auto', fontWeight: '700' }],
          'l-semibold': ['18px', { lineHeight: 'auto', fontWeight: '600' }],
          'l-medium': ['18px', { lineHeight: 'auto', fontWeight: '500' }],
  
          // M
          'm-extrabold': ['16px', { lineHeight: 'auto', fontWeight: '800' }],
          'm-bold': ['16px', { lineHeight: 'auto', fontWeight: '700' }],
          'm-semibold': ['16px', { lineHeight: 'auto', fontWeight: '600' }],
          'm-medium': ['16px', { lineHeight: 'auto', fontWeight: '500' }],
          'm-regular': ['16px', { lineHeight: 'auto', fontWeight: '400' }],
  
          // S
          's-extrabold': ['14px', { lineHeight: 'auto', fontWeight: '800' }],
          's-bold': ['14px', { lineHeight: 'auto', fontWeight: '700' }],
          's-semibold': ['14px', { lineHeight: 'auto', fontWeight: '600' }],
          's-medium': ['14px', { lineHeight: 'auto', fontWeight: '500' }],
          's-regular': ['14px', { lineHeight: 'auto', fontWeight: '400' }],
  
          // XS
          'xs-extrabold': ['12px', { lineHeight: 'auto', fontWeight: '800' }],
          'xs-bold': ['12px', { lineHeight: 'auto', fontWeight: '700' }],
          'xs-semibold': ['12px', { lineHeight: 'auto', fontWeight: '600' }],
          'xs-medium': ['12px', { lineHeight: 'auto', fontWeight: '500' }],
          'xs-regular': ['12px', { lineHeight: 'auto', fontWeight: '400' }],
        },
      }
  },
  plugins: [],
} satisfies Config;
