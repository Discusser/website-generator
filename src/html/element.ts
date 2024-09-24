export abstract class Element {
  parent: HTMLElement | null;
  children: Array<Element>;

  constructor() {
    this.parent = null;
    this.children = [];
  }

  abstract toHTMLString(): string;
  abstract toString(): string;
}

export class TextElement extends Element {
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  toHTMLString(): string {
    return this.text;
  }

  toString(): string {
    return '"' + this.text + '"';
  }
}

export class HTMLElement extends Element {
  tagName: string;
  attributes: Map<string, string | boolean>;
  isVoidElement: boolean;
  textContent: string;

  constructor() {
    super();
    this.tagName = "";
    this.attributes = new Map();
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
        attrs += `${k}`;
        if (typeof v != "boolean") {
          attrs += `="${v}"`;
        }
      });
      attrs += "]";
    }
    return `${this.tagName}${attrs}`;
  }

  override toHTMLString() {
    let str = "<" + this.tagName;
    this.attributes.forEach((v, k) => {
      str += ` ${k}`;
      if (typeof v != "boolean") {
        str += `="${v}"`;
      }
    });
    if (this.isVoidElement) {
      str += "/>";
    } else {
      str += ">";
      this.children.forEach((elem) => (str += elem.toHTMLString()));
      str += "</" + this.tagName + ">";
    }
    return str;
  }
}
