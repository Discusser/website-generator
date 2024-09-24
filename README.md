# website-generator

A basic static website generator written in TypeScript.

To run, you must compile with `tsc` and then run `node src/website_generator.js`
Eventually there will be a way of setting up files to process without writing any JavaScript/TypeScript.

The `HTMLParser` class is what converts an HTML string into an HTML tree that can be easily modified.
The `HTMLTree` class contains a `toHTMLString()` method which converts the object back into a (hopefully) valid HTML string.
