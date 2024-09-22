import { readFileSync } from "fs";
import { HTMLParser } from "./html/parser.js";
import { HTMLElement } from "./html/tree.js";

const buf = readFileSync("./test/src/index.html");
// process.stdout.write(buf.toString());
// process.stdout.write(HTMLParser.parseString(buf.toString()));

const tree = HTMLParser.parseString(buf.toString());
let toVisit: Array<[HTMLElement, number]> = [[tree.root, 0]];
console.log("\n");

while (toVisit.length > 0) {
  let [visiting, depth] = toVisit.pop();
  toVisit = toVisit.concat(visiting.children.reverse().map((e) => [e, depth + 1]));
  console.log("  ".repeat(depth) + "" + visiting);
}
