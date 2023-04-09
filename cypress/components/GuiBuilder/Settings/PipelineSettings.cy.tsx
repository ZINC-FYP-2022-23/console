import PipelineSettings from "@/components/GuiBuilder/Settings/PipelineSettings";
import { guiBuilderModel } from "@/store/GuiBuilder";
import { SettingsRaw } from "@/types/GuiBuilder";
import { settingsToSettingsRaw } from "@/utils/GuiBuilder";
import { createStore } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";

describe("GuiBuilder - <PipelineSettings />", () => {
  beforeEach(() => {
    cy.viewport(550, 800);
  });

  it("sets the `_settings` of the pipeline config", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    cy.mountWithStore(store, <PipelineSettings />);

    // Language
    cy.clickSelectInput("#lang", "C++ (g++)");
    cy.get("#lang_version").type("8");

    // Helper Files
    cy.get("#use_skeleton").click();
    cy.clickSelectInput("#use_template", "None");

    // Stage Settings
    cy.get("#network").click();
    cy.get("#stage_wait_duration_secs").clear().type("10");
    cy.get("#cpus").clear().type("1");
    cy.get("#mem_gb").clear().type("1");

    cy.then(() => {
      const _settings = store.getState().config.editingConfig._settings;
      const settingsRaw = settingsToSettingsRaw(_settings);
      const expectedSettingsRaw: SettingsRaw = {
        lang: "cpp/g++:8",
        use_skeleton: true,
        use_provided: true,
        use_template: undefined,
        early_return_on_throw: false,
        stage_wait_duration_secs: 10,
        cpus: 1,
        mem_gb: 1,
        enable_features: {
          network: false,
          gpu_device: undefined,
        },
      };
      expect(settingsRaw).to.deep.equal(expectedSettingsRaw);
    });
  });

  it("handles template files", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    cy.mountWithStore(store, <PipelineSettings />);

    // Text input
    cy.clickSelectInput("#use_template", "Text input");
    cy.get("#use-template-filenames input").type("a.cpp{Enter}b.cpp");
    cy.then(() => {
      const _settings = store.getState().config.editingConfig._settings;
      const settingsRaw = settingsToSettingsRaw(_settings);
      expect(settingsRaw.use_template).to.equal("FILENAMES");
      expect(settingsRaw.template).to.deep.equal(["a.cpp", "b.cpp"]);
    });

    // File upload
    cy.clickSelectInput("#use_template", "File upload");
    cy.then(() => {
      const _settings = store.getState().config.editingConfig._settings;
      const settingsRaw = settingsToSettingsRaw(_settings);
      expect(settingsRaw.use_template).to.equal("PATH");
      expect(settingsRaw).not.to.have.property("template");
    });
  });

  it("handles GPU selection", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    cy.mountWithStore(store, <PipelineSettings />);

    // Any GPU
    cy.clickSelectInput("#gpus", "Any GPU");
    cy.then(() => {
      const _settings = store.getState().config.editingConfig._settings;
      const settingsRaw = settingsToSettingsRaw(_settings);
      expect(settingsRaw.enable_features?.gpu_device).to.equal("ANY");
    });

    // Choose vendors
    cy.clickSelectInput("#gpus", "Choose vendors");
    cy.get("#NVIDIA").click();
    cy.get("#INTEL").click();
    cy.then(() => {
      const _settings = store.getState().config.editingConfig._settings;
      const settingsRaw = settingsToSettingsRaw(_settings);
      expect(settingsRaw.enable_features?.gpu_device).to.deep.members(["NVIDIA", "INTEL"]);
    });
  });

  describe("Diagnostics", () => {
    it("handles language related diagnostics", () => {
      const model = cloneDeep(guiBuilderModel);
      const store = createStore(model);
      cy.mountWithStore(store, <PipelineSettings />);

      // Missing Version
      store.getActions().config.parseDiagnostics([
        {
          type: "LANG_FORMAT_ERROR",
          message: "field '_settings.lang' is invalid. Correct format: $lang[$/compiler]:$version",
          severity: "ERROR",
          location: { stage: "_settings" },
        },
      ]);
      cy.get('[data-cy="lang-format-error"]').should("be.visible");

      // Unsupported language
      cy.then(() => {
        store.getActions().config.parseDiagnostics([
          {
            type: "LANG_UNSUPPORTED_ERROR",
            message: "field '_settings.lang' is invalid at [_settings]. Language unsupported. cpp null g++",
            severity: "ERROR",
            location: { stage: "_settings" },
          },
        ]);
      });
      cy.get('[data-cy="lang-unsupported-error"]').should("be.visible");
    });
  });
});
