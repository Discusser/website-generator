import { Context } from "../js/context.js";

export abstract class Element {
  parent: HTMLElement | undefined;
  children: Array<Element>;

  constructor() {
    this.parent = undefined;
    this.children = [];
  }

  abstract toHTMLString(): string;
  abstract toString(): string;
  abstract typeName(): string;
}

export class TemplateElement extends Element {
  templateName: string;
  templateValue: string;

  constructor() {
    super();
    this.templateName = "";
    this.templateValue = "";
  }

  readContext(ctx: Context) {
    const val = ctx.variables.get(this.templateName);
    if (val != null) {
      this.templateValue = val;
    }
  }

  toHTMLString(): string {
    return this.templateValue;
  }

  toString(): string {
    return `{{ ${this.templateName} }} -> "${this.templateValue}"`;
  }

  typeName(): string {
    return "TemplateElement";
  }
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

  typeName(): string {
    return "TextElement";
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

  toHTMLString() {
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

  typeName(): string {
    return "HTMLElement";
  }
}
