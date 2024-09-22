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
}

export class HTMLTree {
  root: HTMLElement | null;

  constructor() {
    this.root = null;
  }
}
