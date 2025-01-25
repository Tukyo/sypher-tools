import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/index.ts",
        external: ["ethers"], // Mark "ethers" as external
        output: [
            {
                file: "dist/sypher.esm.js",
                format: "esm",
                sourcemap: true,
            },
            {
                file: "dist/sypher.umd.js",
                format: "umd",
                name: "sypher", // Name for the UMD global variable
                sourcemap: true,
                globals: {
                    ethers: "ethers", // Tell Rollup to use the global "ethers"
                },
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
        ],
    },
    // Minified builds
    {
        input: "src/index.ts",
        external: ["ethers"],
        output: [
            {
                file: "dist/sypher.esm.min.js",
                format: "esm",
                sourcemap: true,
            },
            {
                file: "dist/sypher.umd.min.js",
                format: "umd",
                name: "sypher",
                sourcemap: true,
                globals: {
                    ethers: "ethers",
                },
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
            terser(), // Minify output
        ],
    },
];