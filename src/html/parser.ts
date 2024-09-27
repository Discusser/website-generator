import { Context } from "../js/context.js";
import { HTMLElement, TemplateElement, TextElement } from "./element.js";
import { HTMLTree } from "./tree.js";

export class HTMLParser {
  static parseString(str: string, ctx: Context): HTMLTree {
    const tree = new HTMLTree();

    let currentElement: HTMLElement | undefined = tree.root;
    let readAttributeName = "";
    let readAttributeValue = "";
    let readTagName = "";
    let readTagContents = "";
    let textContentTags: Array<HTMLElement> = [];
    let isFirstChar = true;
    let readDoctype = "";
    let readTemplate = "";

    let readingTag = false;
    let readingClosingTag = false;
    let readingCommentOrDoctype = false;
    let readingSingleString = false;
    let readingDoubleString = false;
    let readingAttributeValue = false;
    let readingAttributeName = false;
    let readingTagName = false;
    let readingTagContents = false;
    let readingDoctype = false;
    let readingComment = false;
    let readingTemplate = false;

    const readingString = () => readingSingleString || readingDoubleString;
    for (let i = 0; i < str.length; i++) {
      // str.charAt returns an empty string if the index is invalid
      const prev = str.charAt(i - 1);
      const curr = str.charAt(i);
      const next = str.charAt(i + 1);

      if (readingDoctype) {
        if (curr == ">") {
          readingDoctype = false;
          tree.doctype = readDoctype;
          readDoctype = "";
        } else {
          readDoctype += curr;
        }
      }

      if (readingTagName) {
        if (/[\s/>]/.test(curr)) {
          readingTagName = false;
          if (readingCommentOrDoctype) {
            if (readTagName.toLowerCase() == "!doctype") {
              readingDoctype = true;
              readTagName = "";
              readDoctype = "";
            } else if (readTagName.startsWith("!--")) {
              readingComment = true;
              readTagName = "";
            }
          } else {
            readingAttributeName = true;
            if (!readingClosingTag) {
              const elem = new HTMLElement();
              // Tag names are case insensitive, but we prefer lowercase for consistency
              elem.tagName = readTagName.toLowerCase();
              elem.parent = currentElement;
              currentElement?.children.push(elem);
              currentElement = elem;

              if (tree.root == null) {
                tree.root = currentElement;
              }

              textContentTags.push(elem);
            }
          }
        } else {
          readTagName += curr;
        }
      } else if (readingAttributeName) {
        if (/[\s/>]/.test(curr)) {
          if (curr == "/" || curr == ">") {
            readingAttributeName = false;
          }

          if (readAttributeName.trim() != "") {
            currentElement?.attributes.set(readAttributeName, true);
            readAttributeValue = "";
            readAttributeName = "";
            readingAttributeValue = false;
            readingAttributeName = true;
          }
        }
        // If we encounter an equal sign, we have to be ready to start reading an attribute value
        else if (curr == "=") {
          readingAttributeName = false;
          readingAttributeValue = true;
        } else {
          readAttributeName += curr;
        }
      }
      // Read strings
      else if (readingString()) {
        if (readingAttributeValue) {
          readAttributeValue += curr;
        }
      } else if (readingTagContents && !readingTag) {
        if (!(curr == "{" && next == "{")) {
          readTagContents += curr;
        }
      }

      if (readingTemplate) {
        if (curr == "}" && prev == "}") {
          const elem = new TemplateElement();
          elem.templateName = readTemplate.slice(0, -1).trim();
          elem.readContext(ctx);
          elem.parent = currentElement;
          currentElement?.children.push(elem);
          readingTemplate = false;
          readingTagContents = true;
          readTemplate = "";
        } else {
          readTemplate += curr;
        }
      }

      // Handle opening tags
      if (curr == "<" && !readingString()) {
        readingTag = true;
        // Stop reading for TextElements once we reach another tag
        if (readingTagContents) {
          readingTagContents = false;
          let contents = readTagContents.slice(0, -1).trim();
          if (contents != "") {
            currentElement?.children.push(new TextElement(contents));
            readTagContents = "";
          }
        }

        // Handle comments/doctype declarations
        if (next == "!") {
          readingCommentOrDoctype = true;
          readingTagName = true;
          readingTag = false;
        } else if (next == "/") {
          readingClosingTag = true;
        } else {
          readingTagName = true;
        }
      }
      // Handle closing tags
      else if (curr == ">" && !readingString()) {
        // We don't really care about comments/doctype declarations, so we can just discard it
        if (readingCommentOrDoctype == true) {
          readingCommentOrDoctype = false;
        }
        // In the case that we just read a tag, we created it and add it to the HTML tree.
        else if (readingTag == true) {
          // If we've just read a closing tag, then there's nothing to do other than go up a level in the tree
          if (readingClosingTag) {
            // If current element's parent is null, then that means that we've reached the end of the HTML
            currentElement = currentElement?.parent;
            if (currentElement == null) {
              break;
            }

            readingClosingTag = false;
            textContentTags.pop();
          } else {
            if (currentElement != null) {
              if (prev == "/" || HTMLElement.isVoidElement(readTagName)) {
                currentElement.isVoidElement = true;
              }

              // If the element is a void element, there is no point in going deeper into the tree because
              // it can't have any children
              if (!currentElement.isVoidElement) {
                // Start reading for TextElements once we close an opening tag
              } else {
                textContentTags.pop();
                currentElement = currentElement.parent;
              }
            }
          }

          readingTagContents = true;
          readTagContents = "";
          readingAttributeName = false;
          readingAttributeValue = false;
          readingTag = false;
          readAttributeName = "";
          readAttributeValue = "";
          readTagName = "";
          isFirstChar = true;
        }
      }
      // Handle opening and closing strings
      else if (curr == '"' && !readingSingleString) {
        readingDoubleString = !readingDoubleString;
        if (!readingDoubleString) {
          if (readingAttributeValue) {
            // Get rid of the trailing " or ' in readAttributeValue
            currentElement?.attributes.set(readAttributeName, readAttributeValue.slice(0, -1));
            readingAttributeValue = false;
            readingAttributeName = true;
            readAttributeName = "";
            readAttributeValue = "";
          }
        }
      } else if (curr == "'" && !readingDoubleString) {
        readingSingleString = !readingSingleString;
        if (!readingSingleString) {
          if (readingAttributeValue) {
            currentElement?.attributes.set(readAttributeName, readAttributeValue.slice(0, -1));
            readingAttributeValue = false;
            readingAttributeName = true;
            readAttributeName = "";
            readAttributeValue = "";
          }
        }
      } else if (curr == "/" && readingClosingTag && !readingString()) {
        readingTagName = true;
      } else if (curr == "{" && prev == "{" && !readingString()) {
        readingTagContents = false;
        let contents = readTagContents.slice(0, -1).trim();
        if (contents != "") {
          currentElement?.children.push(new TextElement(contents));
        }
        readTagContents = "";
        readingTemplate = true;
      }

      if (!readingTag) {
        if (!isFirstChar) {
          textContentTags.forEach((elem) => (elem.textContent += curr));
        } else {
          isFirstChar = false;
        }
      }
    }

    return tree;
  }
}
