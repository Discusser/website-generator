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
  attributes: Map<string, string>;
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
        attrs += `${k}="${v}"`;
      });
      attrs += "]";
    }
    return `${this.tagName}${attrs}`;
  }

  override toHTMLString() {
    let str = "<" + this.tagName;
    this.attributes.forEach((v, k) => (str += ` ${k}="${v}`));
    if (this.isVoidElement) {
      str += "/>\n";
    } else {
      str += ">\n";
      // TODO: Create an Element class, which gives HTMLElement and TextElement. An HTMLElement represents a
      // regular HTML element, while a TextElement represents some text that can be present inside an HTMLElement.
      // By doing this, we can ensure that the order of text and elements is preserved, because we can insert the
      // text elements in the tree. For example:
      // <p>
      // Hello, world <code>; i++</code>. And goodbye
      // </p>
      // This can be translated into the following tree:
      // p (HTMLElement)
      //  "Hello, world " (TextElement)
      //  code (HTMLElement)
      //  ". And goodbye" (TextElement)
      this.children.reverse().forEach((elem) => (str += elem.toHTMLString() + "\n"));
      str += "</" + this.tagName + ">";
    }
    return str;
  }
}
