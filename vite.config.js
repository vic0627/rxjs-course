import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
    resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(__dirname, "./src/"),
            },
        ],
    },
    optimizeDeps: {
        exclude: ["@vic0627/karman"],
    },
});
