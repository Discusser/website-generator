import { Element, HTMLElement } from "./element.js";

export class HTMLTree {
  root: HTMLElement | null;

  constructor() {
    this.root = null;
  }

  printTree() {
    let toVisit: Array<[Element, number]> = [[this.root, 0]];

    while (toVisit.length > 0) {
      let [visiting, depth] = toVisit.pop();
      toVisit = toVisit.concat(visiting.children.reverse().map((e) => [e, depth + 1]));
      console.log("  ".repeat(depth) + visiting);
    }
  }

  toHTMLString(): string {
    return this.root.toHTMLString();
  }
}
