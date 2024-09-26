export class Context {
  variables: Map<string, any>;
  functions: Map<string, any>;

  constructor() {
    this.variables = new Map();
    this.functions = new Map();
  }
}
