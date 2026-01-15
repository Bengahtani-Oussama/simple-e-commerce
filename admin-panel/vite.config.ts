import { defineConfig, type TerserOptions } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      // fastRefresh: true,
      // Babel configuration for better compatibility
      babel: {
        plugins: [],
      },
    }),
  ],

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },

  // Server configuration
  server: {
    port: 3001,
    host: true, // Listen on all addresses
    strictPort: true, // Exit if port is already in use
    open: false, // Don't open browser automatically
    cors: true,
    proxy: {
      // Proxy API requests to backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // Disable sourcemaps in production
    minify: "terser",
    terserOptions: {
      ...(process.env.NODE_ENV === "production"
        ? { compress: { drop_console: true, drop_debugger: true } }
        : {}),
      // ... other options
    } as TerserOptions,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "chart-vendor": ["recharts"],
          "ui-vendor": ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "zustand",
      "lucide-react",
      "date-fns",
    ],
  },

  // Preview configuration (for production preview)
  preview: {
    port: 3001,
    host: true,
    strictPort: true,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
