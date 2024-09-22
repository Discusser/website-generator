import { HTMLElement, HTMLTree } from "./tree.js";

export class HTMLParser {
  static parseString(str: string): HTMLTree {
    const tree = new HTMLTree();

    let currentElement: HTMLElement | null = tree.root;
    let readAttributeName = "";
    let readAttributeValue = "";
    let readTagName = "";
    let readTagContents = "";

    let readingTag = false;
    let readingClosingTag = false;
    let readingCommentOrDoctype = false;
    let readingSingleString = false;
    let readingDoubleString = false;
    let readingAttributeValue = false;
    let readingAttributeName = false;
    let readingTagName = false;
    let readingTagContents = false;

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
          readingAttributeName = true;

          if (!readingClosingTag) {
            const elem = new HTMLElement();
            elem.tagName = readTagName;
            elem.parent = currentElement;
            currentElement?.children.push(elem);
            currentElement = elem;
            readTagName = "";

            if (tree.root == null) {
              tree.root = currentElement;
            }
          }
          // console.log(`Read tag name ${readTagName}`);
        } else {
          readTagName += curr;
        }
      } else if (readingAttributeName) {
        if (curr == "/" || curr == ">") {
          readingAttributeName = false;
          if (readAttributeName.trim() != "") {
            // If we're reading the attribute name and are interrupted by characters that indicate the end of the tag,
            // it is safe to assume there is no associated value, and there the attribute has a boolean value of true
            readAttributeValue = "true";
          }
        }
        // If we encounter an equal sign, we have to be ready to start reading an attribute value
        else if (curr == "=") {
          readingAttributeName = false;
          readingAttributeValue = true;
          console.log(`ATTR NAME '${readAttributeName}'`);
        } else if (curr == " ") {
          if (readAttributeName.trim() != "") {
            readingAttributeName = false;
            readAttributeValue = "true";
          }
        } else {
          readAttributeName += curr;
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
            // process.stdout.write(`Set parent of ${currentElement.tagName} to ${currentElement.parent?.tagName}`);
            currentElement = currentElement.parent;
            if (currentElement == null) {
              break;
            }
            readingClosingTag = false;
          } else {
            // TODO: Add list of void elements https://developer.mozilla.org/en-US/docs/Glossary/Void_element
            if (prev == "/") {
              currentElement.isVoidElement = true;
            }

            // If the element is a void element, there is no point in going deeper into the tree because
            // it can't have any children
            // process.stdout.write(`Read element ${currentElement.tagName}, parent=${currentElement.parent?.tagName}`);
            if (!currentElement.isVoidElement) {
              // Set the current element to the newly read element, thus going one level deeper in the tree
              // process.stdout.write(" Set to current element");
              // currentElement = elem;
            } else {
              currentElement = currentElement.parent;
            }
          }

          readingAttributeName = false;
          readingAttributeValue = false;
          readAttributeName = "";
          readAttributeValue = "";
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
            readingAttributeName = true;
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
            readingAttributeName = true;
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
