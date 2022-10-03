/**
 * A pipeline stage in the assignment configuration.
 */
class Stage {
  /**
   * The stage's key in the config YAML (e.g. `"stdioTest"`, `"compile:main"`).
   */
  id: string;

  /**
   * Configuration of the stage.
   */
  config: any;

  constructor(id: string, config: any) {
    this.id = id;
    this.config = config;
  }

  /**
   * Gets the type of the stage, such as `"StdioTest"`, `"Compile"`, etc.
   */
  get type() {
    const name = this.id.split(":")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

export default Stage;
