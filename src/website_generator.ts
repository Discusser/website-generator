import { readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import * as prettier from "prettier";

const buf = readFileSync("./test/src/index.html");

const tree = HTMLParser.parseString(buf.toString());
tree.printTree();
console.log(await prettier.format(tree.toHTMLString(), { parser: "html" }));
