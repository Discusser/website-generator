import { readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import * as prettier from "prettier";
import { Context } from "./js/context.js";
import path, { dirname, join, relative } from "path";
// @ts-ignore
import conf from "../website_generator.config.js";
import { Config } from "./config.js";
import { readdir, readFile, stat, writeFile } from "fs/promises";

const config: Config = conf;
const SRC_PATH = config.dirs.src;
const TEMPLATES_PATH = config.dirs.templates;
const OUT_PATH = config.dirs.out;

const templates = await readdir(TEMPLATES_PATH);

const context = new Context();
context.variables.set("page_name", "My web page");
context.variables.set("page_title", "discusser");
context.variables.set("page_footer", "Copyright Discusser 2024");

async function processTemplates() {
  templates.forEach((file) => {
    const buffer = readFileSync(path.join(TEMPLATES_PATH, file));
    const content = buffer.toString();
    const fileName = file.split(".")[0];
    console.log(`Parsing template ${fileName}`);
    context.templates.set(fileName, (props) => {
      const ctxCopy = new Context(context);
      props.forEach((val, key) => ctxCopy.variables.set(key, val));
      const parsed = HTMLParser.parseString(content, ctxCopy);
      return parsed.toHTMLString();
    });
  });
}

async function transformFiles() {
  await readdir(OUT_PATH).then((files) => {
    console.log(`Clearing HTML files in ${relative("./", OUT_PATH)}`);
    files.forEach((file) => {
      rmSync(path.join(OUT_PATH, file), { recursive: true });
    });

    readdir(SRC_PATH, { recursive: true }).then((files) => {
      files.forEach((file) => {
        const path = join(SRC_PATH, file);
        stat(path).then((stat) => {
          if (!stat.isDirectory()) {
            readFile(path).then(async (buffer) => {
              const tree = HTMLParser.parseString(buffer.toString(), context);
              const outputPath = join(OUT_PATH, file);
              let output = tree.toHTMLString();
              if (config.outputFormatted) {
                output = await prettier.format(output, { parser: "html" });
              }
              writeFile(outputPath, output).then(() => {
                console.log(`Transformed file ${relative("./", path)} to ${relative("./", outputPath)}`);
              });
            });
          }
        });
      });
    });
  });
}

await processTemplates();
await transformFiles();
