import type { Config } from "tailwindcss";
import {nextui} from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        card: '0px 7px 10px 0px #0000001A',
      },
    },
    colors: {
      action: '#0F61FF',
      'actions-hover': '#062A6E',
      divider: '#BEC4CF',
      light: '#616F82',
      white: '#FFFFFF',
      'container-grey': '#F2F2F2', // Surfaces/container-2
      'project-focus': '#0A0B0D', // focus
      'light-grey': '#0000001A',
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
