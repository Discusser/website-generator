export interface Config {
  dirs: {
    src: string;
    templates: string;
    out: string;
  };
  outputFormatted: boolean | undefined;
}
