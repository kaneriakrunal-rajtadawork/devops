// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
import { loadSecrets } from "./src/constants/globals.constants.js";

await loadSecrets();

const nextConfig = {
    distDir:'build',
    // output : 'standalone',
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            type: "asset/resource", // Treat SVGs as static assets
        });
        return config;
    },
};

export default nextConfig;
