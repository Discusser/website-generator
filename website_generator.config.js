import { resolve } from "path";

/**
 * @typedef {import("./src/config.js").Config} Config
 */
const config = {
  dirs: {
    src: resolve("./test/src"),
    templates: resolve("./test/templates"),
    out: resolve("./test/out"),
  },
};

export default config;
