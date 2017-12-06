/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />
/// <reference path='../typings/index.d.ts' />

import Build_Client = require("TFS/Build/RestClient");

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
  WidgetHelpers.IncludeWidgetConfigurationStyles();
  VSS.register("BuildWarningsChartWidget.Configuration", () => {
    var configuration = new ChartConfiguration(WidgetHelpers);
    return configuration;
  })

  VSS.notifyLoadSucceeded();
});

export class ChartConfiguration {

  widgetConfigurationContext = null;
  $select = $('select');

  constructor(public WidgetHelpers) { }

  public load(widgetSettings, widgetConfigurationContext) {

    var _that = this; // ??
    this.widgetConfigurationContext = widgetConfigurationContext;

    var settings: IChartSettings = JSON.parse(widgetSettings.customSettings.data);

    this.showBuilds(settings);

    //VSS.resize();

    // Change notification
    this.$select.change(() => {
      this.widgetConfigurationContext.notify(this.WidgetHelpers.WidgetEvent.ConfigurationChange,
        this.WidgetHelpers.WidgetEvent.Args(this.getCustomSettings()));
    });

    return this.WidgetHelpers.WidgetStatusHelper.Success();

  }

  public onSave() {

    var isValid = true;
    if (isValid) {
      return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
    }
    else {
      return this.WidgetHelpers.WidgetConfigurationSave.Invalid();
    }

  }

  private showBuilds(settings: IChartSettings) {

    var projectId = VSS.getWebContext().project.id;
    Build_Client.getClient().getDefinitions(projectId).then(definitions => {
      for (var i = 0; i < definitions.length; i++) {
        var opt = document.createElement('option');
        opt.value = definitions[i].id.toString();
        opt.innerHTML = definitions[i].name;
        this.$select[0].appendChild(opt);
      }
    });

    // Select the configured build, or default
    if (settings && settings.definitionId) {
      this.$select.val(settings.definitionId);
    }

  }

  private getCustomSettings() {

    var build = this.$select.val();
    var name = $("#build-dropdown option:selected").text();

    var result = {
      data: JSON.stringify(<IChartSettings>
        {
          definitionId: build,
          buildName: name
        })
    };
    return result;

  }

}