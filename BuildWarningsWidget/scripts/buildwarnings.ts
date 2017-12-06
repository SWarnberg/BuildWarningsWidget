/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />

import Build_Client = require("TFS/Build/RestClient");
import Build_Contracts = require("TFS/Build/Contracts");

//import Combos = require("VSS/Controls/Combos");

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
  WidgetHelpers.IncludeWidgetStyles();
  VSS.register("BuildWarningsWidget", () => {
    var buildWarningsWidget = new BuildWarningsWidget(WidgetHelpers);
    return buildWarningsWidget;
  })

  VSS.notifyLoadSucceeded();
});

export class BuildWarningsWidget {

  constructor(public WidgetHelpers) { }

  public load(widgetSettings) {
    return this.showBuildWarnings(widgetSettings);
  }
  public reload(widgetSettings) {
    return this.showBuildWarnings(widgetSettings);
  }

  private showBuildWarnings(widgetSettings) {

    var customSettings = <ISettings>JSON.parse(widgetSettings.customSettings.data);

    if (!customSettings) {
      customSettings = {
        backgroundColor: "rgb(0, 156, 204);", //"green",
        foregroundColor: "white",
        definitionId: null,
        buildName: null
      }
      return this.displayWidget(customSettings, 0, null);
    }

    try {
      var buildWarnings: number = 0;
      var projectId = VSS.getWebContext().project.id;
      var buildFilter = Build_Contracts.BuildResult.Succeeded;
      var buildClient = Build_Client.getClient();
      return buildClient.getBuilds(projectId, [customSettings.definitionId], undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, buildFilter).then(builds => {
          if (builds.length > 0) {
            var buildId = builds[0].id;
            var link = builds[0]._links.web.href;
            return buildClient.getBuildTimeline(projectId, buildId).then(details => {
              for (var i = 0; i < details.records.length; i++) {
                if (details.records[i].type == "Task") {
                  buildWarnings = buildWarnings + details.records[i].warningCount;
                }
              }
              return this.displayWidget(customSettings, buildWarnings, link);
            }, reason => {
              return this.displayWidget(customSettings, 0, link);
            });
          }
          else {
            buildWarnings = 0;
            return this.displayWidget(customSettings, buildWarnings, null);
          }
        }, reason => {
          return this.displayWidget(customSettings, 0, null);
        });
    }
    catch (e) {
      console.log(e);
      return this.WidgetHelpers.WidgetStatusHelper.Failure(e.message);
    }

  }

  private displayWidget(customSettings: ISettings, warnings: number, uri: string) {

    //var $container = $('#countdown-container');
    var $title = $("#build-widget #widget-title");
    var $warnings = $("#build-widget #widget-count");
    var $buildname = $("#build-widget #widget-details");
    var $widgetBody = $("#widget-body");
    var $link = $("#build-link");

    // Configure colors
    if (customSettings.backgroundColor) {
      $widgetBody.css("background-color", customSettings.backgroundColor);
    }
    if (customSettings.foregroundColor) {
      $widgetBody.css("color", customSettings.foregroundColor);
      $title.add($warnings).add($buildname).css("color", customSettings.foregroundColor);
    }

    // Add build and count
    if (!customSettings.definitionId) {
      $buildname.empty();
      $buildname.text("No build selected.");
      $warnings.empty();
    }
    else {
      $buildname.text(customSettings.buildName);
      $warnings.text(warnings.toLocaleString());
    }

    // Change font size for big counts
    if (warnings > 9999) {
      $warnings.css("font-size", "44px");
    }
    else if (warnings > 999) {
      $warnings.css("font-size", "56px");
    }

    // Add Uri
    if (uri) {
      $link.attr("href", uri);
    }

    return this.WidgetHelpers.WidgetStatusHelper.Success();

  }

}