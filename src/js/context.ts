type Template = (props: Map<string, string | boolean>) => string;

export class Context {
  variables: Map<string, any>;
  functions: Map<string, any>;
  templates: Map<string, Template>;

  constructor(ctx?: Context) {
    this.variables = new Map(ctx?.variables);
    this.functions = new Map(ctx?.functions);
    this.templates = new Map(ctx?.templates);
  }
}
