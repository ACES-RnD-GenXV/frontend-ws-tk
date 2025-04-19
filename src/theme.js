// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e8f5fe",
      100: "#c9e4f9",
      200: "#a7d3f5",
      300: "#84c1f0",
      400: "#62b0ec",
      500: "#3f9fe7",
      600: "#327fb9",
      700: "#265f8b",
      800: "#193f5c",
      900: "#0d202e",
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
      },
    },
  },
});

export default theme;
