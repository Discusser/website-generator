import { readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";

const buf = readFileSync("./test/src/index.html");

const tree = HTMLParser.parseString(buf.toString());
tree.printTree();
