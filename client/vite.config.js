import { minifyHtml } from "vite-plugin-html";

export default {
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  plugins: [minifyHtml()],
};
