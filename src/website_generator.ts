import { readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import * as prettier from "prettier";
import { Context } from "./js/context.js";

const buf = readFileSync("./test/src/index.html");

const ctx = new Context();
// TODO: Find a more user friendly way to declare variables and templates
ctx.variables.set("page_name", "My web page");
ctx.variables.set("page_title", "discusser");
ctx.variables.set("page_footer", "Copyright Discusser 2024");
ctx.templates.set("head", (props) => {
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${props.get("title")}</title>
  <link href="css/style.css" rel="stylesheet" />
  </head>`;
});
const tree = HTMLParser.parseString(buf.toString(), ctx);
// tree.printTree();
console.log(buf.toString());
console.log(await prettier.format(tree.toHTMLString(), { parser: "html" }));
