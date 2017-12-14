/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />

import Build_Client = require("TFS/Build/RestClient");
import Build_Contracts = require("TFS/Build/Contracts");
import Q = require("q");

VSS.require(["TFS/Dashboards/WidgetHelpers", "Charts/Services"], (WidgetHelpers, ChartService) => {
  WidgetHelpers.IncludeWidgetStyles();
  VSS.register("BuildWarningsChartWidget", () => {
    var buildWarningsWidget = new BuildWarningsChart(WidgetHelpers, ChartService);
    return buildWarningsWidget;
  })
  VSS.notifyLoadSucceeded();
});

export class BuildWarningsChart {

  constructor(public WidgetHelpers, public ChartsServices) { }

  public load(widgetSettings) {
    return this.showBuildWarnings(widgetSettings);
  }
  public reload(widgetSettings) {
    return this.showBuildWarnings(widgetSettings);
  }

  private showBuildWarnings(widgetSettings) {

    var customSettings = <IChartSettings>JSON.parse(widgetSettings.customSettings.data);
    var colSpan = widgetSettings.size.columnSpan;
    var rowSpan = widgetSettings.size.rowSpan;
    var height, widht;

    if (!customSettings) {
      customSettings = {
        definitionId: null,
        buildName: null
      }
      return this.displayWidget(customSettings, null);
    }

    switch (colSpan) {
      //case 2:
      //  widht = "302";
      //  break;
      case 3:
        widht = "472";
        break;
      case 4:
        widht = "642";
        break;
      default:
        widht = "302";
        break;
    }
    height = "290";
    //switch (rowSpan) {
    //  //case 1:
    //  //  height = "114";
    //  //  break;
    //  case 2:
    //    height = "290";
    //    break;
    //  default:
    //    height = "114";
    //    break;
    //}

    try {
      var projectId = VSS.getWebContext().project.id;
      var buildFilter = Build_Contracts.BuildResult.Succeeded;
      var buildClient = Build_Client.getClient();
      return buildClient.getBuilds(projectId, [customSettings.definitionId], undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, buildFilter)
        .then(builds => {
          var warnings: number[] = [];
          var dates: string[] = [];
          var chain = Q.when();
          var promises: IPromise<number>[] = [];

          for (var i = builds.length - 1; i >= 0; i--) {
            dates.push(builds[i].finishTime.toLocaleDateString('en-US'));
            var buildId = builds[i].id;

            var promise = buildClient.getBuildTimeline(projectId, buildId)
              .then(details => {
                var buildWarnings: number = 0;
                for (var i = 0; i < details.records.length; i++) {
                  if (details.records[i].type == "Task") {
                    buildWarnings = buildWarnings + details.records[i].warningCount;
                  }
                }
                return buildWarnings;
              });
            promises.push(promise);
          }
          return Q.all(promises).then(numbers => {
            return this.displayWidget(customSettings, numbers, dates, widht, height);
          });
        }, reason => {
          return this.displayWidget(customSettings);
        });
    }
    catch (e) {
      console.log(e);
      return this.WidgetHelpers.WidgetStatusHelper.Failure(e.message);
    }

  }

  private displayWidget(customSettings: IChartSettings, warnings: number[] = undefined, dates: string[] = undefined, widht: string = "302", height: string = "114") {

    var $title = $("#widget-title");
    var $container = $("#Chart-Container");
    $container.empty();

    // Add build and count
    if (!customSettings.definitionId) {
      $container.text("No build selected.")
      return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
    else if (!warnings || !dates || dates.length < 2) {
      $container.text("No data to plot.")
      return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
    else {
      $title.text("Build warnings trend: " + customSettings.buildName);
      return this.ChartsServices.ChartsService.getService().then((chartSvc) => {
        var $container = $('#Chart-Container');

        // Create the chart json
        var chartOptions = {
          "hostOptions": {
            "height": height,
            "width": widht
          },
          "chartType": "stackedArea",
          "series": [
            {
              "name": "Total warnings",
              "data": warnings
              //"data": [1, 3, 4, 3, 6, 1, 9, 0, 8, 11]
            }
          ],
          "xAxis": {
            "labelFormatMode": "dateTime_DayInMonth",
            "labelValues": dates
            //"labelValues": ["1/1/2016", "1/2/2016"]
          }
        }
        chartSvc.createChart($container, chartOptions);
        return this.WidgetHelpers.WidgetStatusHelper.Success();

      }, reason => {
        return this.WidgetHelpers.WidgetStatusHelper.Failure("Unable to get chart service.");
      });
    }

  }

}