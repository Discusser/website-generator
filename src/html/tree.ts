export class HTMLElement {
  tagName: string;
  attributes: Map<string, string>;
  children: Array<HTMLElement>;
  parent: HTMLElement | null;
  isVoidElement: boolean;

  constructor() {
    this.tagName = "";
    this.attributes = new Map();
    this.children = [];
    this.parent = null;
    this.isVoidElement = false;
  }

  toString() {
    let attrs = "";
    this.attributes.forEach((v, k) => {
      if (attrs.length > 0) {
        attrs += " ";
      }
      attrs += `${k}="${v}"`;
    });
    return `${this.tagName}[${attrs}]`;
  }
}

export class HTMLTree {
  root: HTMLElement | null;

  constructor() {
    this.root = null;
  }
}
