/**
 * A pipeline stage in the assignment configuration.
 */
interface Stage {
  /** The stage's key in the config YAML (e.g. `"stdioTest"`, `"compile:main"`). */
  id: string;
  /** Configuration of the stage. */
  config: any;
}

export default Stage;
