import { readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import * as prettier from "prettier";
import { Context } from "./js/context.js";

const buf = readFileSync("./test/src/index.html");

const ctx = new Context();
ctx.variables.set("my_var", "Hey there!");
const tree = HTMLParser.parseString(buf.toString(), ctx);
// tree.printTree();
console.log(await prettier.format(tree.toHTMLString(), { parser: "html" }));
