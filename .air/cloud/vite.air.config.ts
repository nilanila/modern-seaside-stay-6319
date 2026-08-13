// Vite config overlay used only by the Air cloud environment (.air/cloud/startup.sh).
//
// It reuses the repository's own vite.config.ts unchanged and layers on the settings
// the cloud dev server needs: bind to every interface, keep the fixed port, accept the
// proxy's public Host header, and point the HMR client at the https proxy origin (443)
// instead of localhost:8080, which is not reachable from the browser.
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "../../vite.config";

export default defineConfig(async (env) => {
  const base = typeof baseConfig === "function" ? await baseConfig(env) : baseConfig;

  return mergeConfig(base, {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      // Honoured by Vite >= 5.4.12; older versions do no Host checking at all.
      allowedHosts: true,
      hmr: { protocol: "wss", clientPort: 443 },
    },
  });
});
