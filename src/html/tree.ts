export class HTMLElement {
  tagName: string;
  attributes: Map<string, string>;
  children: Array<HTMLElement>;
  parent: HTMLElement | null;
  isVoidElement: boolean;
  textContent: string;

  constructor() {
    this.tagName = "";
    this.attributes = new Map();
    this.children = [];
    this.parent = null;
    this.isVoidElement = false;
    this.textContent = "";
  }

  static isVoidElement(tagName: string): boolean {
    // https://developer.mozilla.org/en-US/docs/Glossary/Void_element
    return [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ].includes(tagName);
  }

  toString() {
    let attrs = "";
    if (this.attributes.size > 0) {
      attrs = "[";
      this.attributes.forEach((v, k) => {
        if (attrs.length > 1) {
          attrs += " ";
        }
        attrs += `${k}="${v}"`;
      });
      attrs += "]";
    }
    return `${this.tagName}${attrs}`;
  }

  toHTMLString() {
    let str = "<" + this.tagName;
    this.attributes.forEach((v, k) => (str += ` ${k}="${v}`));
    if (this.isVoidElement) {
      str += "/>\n";
    } else {
      str += ">\n";
      this.children.reverse().forEach((elem) => (str += elem.toHTMLString() + "\n"));
      str += "</" + this.tagName + ">";
    }
    return str;
  }
}

export class HTMLTree {
  root: HTMLElement | null;

  constructor() {
    this.root = null;
  }

  printTree() {
    let toVisit: Array<[HTMLElement, number]> = [[this.root, 0]];

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
