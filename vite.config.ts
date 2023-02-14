import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert'
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({

    plugins: [react(), viteTsconfigPaths(), svgrPlugin(), mkcert()],
    build: {
        outDir: "build",
    }
});