import { readdirSync, readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import * as prettier from "prettier";
import { Context } from "./js/context.js";
import path from "path";

const TEMPLATES_PATH = "./test/templates/";

const buf = readFileSync("./test/src/index.html");
export const templates = readdirSync(TEMPLATES_PATH);

const ctx = new Context();
// TODO: Find a more user friendly way to declare variables and templates
//
// <head>
//   <meta charset="utf-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1" />
//   <title>{{ title }}</title>
//   <link href="css/style.css" rel="stylesheet" />
// </head>
//
// {{ head title=page_title }}
ctx.variables.set("page_name", "My web page");
ctx.variables.set("page_title", "discusser");
ctx.variables.set("page_footer", "Copyright Discusser 2024");
templates.forEach((file) => {
  const content = readFileSync(path.join(TEMPLATES_PATH, file)).toString();
  ctx.templates.set(file.split(".")[0], (props) => {
    const ctxCopy = new Context(ctx);
    props.forEach((val, key) => ctxCopy.variables.set(key, val));
    const parsed = HTMLParser.parseString(content, ctxCopy);
    return parsed.toHTMLString();
  });
});
const tree = HTMLParser.parseString(buf.toString(), ctx);
console.log(await prettier.format(tree.toHTMLString(), { parser: "html" }));
