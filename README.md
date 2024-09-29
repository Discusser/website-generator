# website-generator

A basic static website generator written in TypeScript. This is not intended to be published, and I don't really know how to do so, so this project will just exist on this GitHub repository. Examples are available in the `test` directory, with an example config file in `website_generator.config.js`.

To run, you must compile with `tsc` and then run `node src/website_generator.js`. You can also do `npm run dev`.
Eventually there will be a way of setting up files to process without writing any JavaScript/TypeScript.

The `HTMLParser` class is what converts an HTML string into an HTML tree that can be easily modified.
The `HTMLTree` class contains a `toHTMLString()` method which converts the object back into a (hopefully) valid HTML string.

With templates, you can avoid rewriting boilerplate HTML. The HTML files are in the `test/src/` directory, while the templates are in `test/templates`. The program discovers every file listed in the `templates` directory. If, for example, there exists a file
`head.html` in that directory, then you can use that template in HTML files found in the `src` directory, by simply writing `{{ template_name }}`, with `template_name` being `head` here (the file name without the extension). Properties can be passed in a similar manner to a regular HTML element, as can be seen below. These properties can
either be variables defined in the `Context` object passed to the `HTMLParser`, or simply strings, which are interpreted normally. We can define `templates/head.html` like so:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{ title }}</title>
  <link href="css/style.css" rel="stylesheet" />
</head>
```

and then we can write the following in our main HTML file:

```html
<html lang="en">
  {{ head title=page_title }}
</html>
```

which will then expand to this after running the program (if we assume that `page_title` is set to `discusser`):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>discusser</title>
    <link href="css/style.css" rel="stylesheet" />
  </head>
</html>
```

If the template file contains another template that isn't passed as an attribute, then it will attempt to read the value of the template from the context that the HTML file including it used. For example, if our main HTML file has a variable `my_var` set to `hello`, and in one of the templates that the main HTML file uses, we have `{{ my_var }}`, and it is not passed as a property, then it will expand to `hello`.

Templates can also be nested, just be careful not to do something that will cause an infinite loop. Here is an example:

`header.html`:

```html
<header>{{ big-text text=page_name }</header>
```

`big-text.html`:

```html
<div style="background-color: red">
  <h1>{{ text }}</h1>
</div>
```

With this, and `page_name` set to `My web page`, the `header` template expands to:

```html
<header>
  <div style="background-color: red">
    <h1>My web page</h1>
  </div>
</header>
```
