#!/usr/bin/env node
/**
 * Prepends a Promise.withResolvers polyfill to the pdfjs worker file.
 * pdfjs v5 calls Promise.withResolvers() (ES2024) which is only available
 * in Safari 17.4+ / iOS 17.4+. This patch makes it work on older devices.
 */
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const dest = resolve(__dirname, "../public/pdf.worker.min.mjs");

// Copy fresh from node_modules
copyFileSync(src, dest);

// Prepend polyfill
const polyfill = `/* Promise.withResolvers polyfill for Safari<17.4 / iOS<17.4 */
if(typeof Promise.withResolvers==="undefined"){Promise.withResolvers=function(){var r,j;var p=new Promise(function(a,b){r=a;j=b});return{promise:p,resolve:r,reject:j}}}
`;
const original = readFileSync(dest, "utf8");
writeFileSync(dest, polyfill + original, "utf8");

console.log("✓ pdf.worker.min.mjs patched with Promise.withResolvers polyfill");
