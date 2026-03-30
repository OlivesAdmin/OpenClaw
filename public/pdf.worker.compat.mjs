/**
 * Compatibility wrapper for pdf.worker.min.mjs.
 * Polyfills Promise.withResolvers (ES2024) before loading the worker,
 * so pdfjs v5 runs on Safari < 17.4 / iOS < 17.4.
 */
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((r, j) => { resolve = r; reject = j; });
    return { promise, resolve, reject };
  };
}

// Import the actual worker (registers message handlers on `self` as a side effect)
// and re-export WorkerMessageHandler for pdfjs's fake-worker fallback path.
export { WorkerMessageHandler } from "./pdf.worker.min.mjs";
