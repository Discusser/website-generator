import { HTMLElement, HTMLTree } from "./tree.js";

export class HTMLParser {
  static parseString(str: string): HTMLTree {
    const tree = new HTMLTree();

    let currentElement: HTMLElement | null = tree.root;
    let readAttributeName = "";
    let readAttributeValue = "";
    let readTagName = "";

    let readingTag = false;
    let readingClosingTag = false;
    let readingCommentOrDoctype = false;
    let readingSingleString = false;
    let readingDoubleString = false;
    let readingAttributeValue = false;
    let readingAttributeName = false;
    let readingTagName = false;

    const readingString = () => readingSingleString || readingDoubleString;
    for (let i = 0; i < str.length; i++) {
      // str.charAt returns an empty string if the index is invalid
      const prev = str.charAt(i - 1);
      const curr = str.charAt(i);
      const next = str.charAt(i + 1);

      process.stdout.write(curr);

      if (readingTagName) {
        if (/[\s/>]/.test(curr)) {
          readingTagName = false;
          // console.log(`Read tag name ${readTagName}`);
        } else {
          readTagName += curr;
        }
      }
      // Read strings
      else if (readingString()) {
        if (readingAttributeValue) {
          readAttributeValue += curr;
        }
      }

      // Handle opening tags
      if (curr == "<" && !readingString()) {
        readingTag = true;
        // Handle comments/doctype declarations
        if (next == "!") {
          readingCommentOrDoctype = true;
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
            // console.log(`Closed ${currentElement.tagName} with parent ${currentElement.parent?.tagName}`);
            currentElement = currentElement.parent;
            if (currentElement == null) {
              break;
            }
            readingClosingTag = false;
          } else {
            const elem = new HTMLElement();

            elem.tagName = readTagName;

            // TODO: Add list of void elements https://developer.mozilla.org/en-US/docs/Glossary/Void_element
            if (prev == "/") {
              elem.isVoidElement = true;
            }

            // Set this element's parent. If the tree is empty, set it as root
            elem.parent = currentElement;
            currentElement?.children.push(elem);
            if (tree.root == null) {
              tree.root = elem;
            }

            // If the element is a void element, there is no point in going deeper into the tree because
            // it can't have any children
            process.stdout.write(`Read element ${elem.tagName}, parent=${elem.parent?.tagName}`);
            if (!elem.isVoidElement) {
              // Set the current element to the newly read element, thus going one level deeper in the tree
              process.stdout.write(" Set to current element");
              currentElement = elem;
            }
          }

          readTagName = "";
        }
      }
      // Handle opening and closing strings
      else if (curr == '"') {
        readingDoubleString = !readingDoubleString;
        if (!readingDoubleString) {
          if (readingAttributeValue) {
            // Get rid of the trailing " or ' in readAttributeValue
            currentElement.attributes.set(readAttributeName, readAttributeValue.slice(0, -1));
            readingAttributeValue = false;
            readAttributeName = "";
            readAttributeValue = "";
          }
        }
      } else if (curr == "'") {
        readingSingleString = !readingSingleString;
        if (!readingSingleString) {
          if (readingAttributeValue) {
            currentElement.attributes.set(readAttributeName, readAttributeValue.slice(0, -1));
            readingAttributeValue = false;
            readAttributeName = "";
            readAttributeValue = "";
          }
        }
      } else if (curr == "/" && readingClosingTag && !readingString()) {
        readingTagName = true;
      }
    }

    return tree;
  }
}
