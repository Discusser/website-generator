type Template = (props: Map<string, string | boolean>) => string;

export class Context {
  variables: Map<string, any>;
  functions: Map<string, any>;
  templates: Map<string, Template>;

  constructor() {
    this.variables = new Map();
    this.functions = new Map();
    this.templates = new Map();
  }
}
