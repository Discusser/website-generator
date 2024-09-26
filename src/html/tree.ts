import { Element, HTMLElement } from "./element.js";

export class HTMLTree {
  root: HTMLElement | undefined;
  doctype: string;

  constructor() {
    this.root = undefined;
    this.doctype = "";
  }

  printTree(verbose: boolean = false) {
    if (this.root == undefined) return;

    let toVisit: Array<[Element, number]> = [[this.root, 0]];

    while (toVisit.length > 0) {
      let t = toVisit.pop();
      if (t == undefined) return;
      let [visiting, depth] = t;
      toVisit = toVisit.concat(visiting.children.toReversed().map((e) => [e, depth + 1]));
      console.log("  ".repeat(depth) + (verbose ? visiting.typeName() + ": " : "") + visiting);
    }
  }

  toHTMLString(): string {
    // If no doctype is specified, we assume HTML5
    return `<!doctype ${this.doctype ?? "html"}>` + this.root?.toHTMLString() ?? "";
  }
}
