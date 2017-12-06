/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />
define(["require", "exports", "TFS/Build/RestClient", "TFS/Build/Contracts", "q"], function (require, exports, Build_Client, Build_Contracts, Q) {
    VSS.require(["TFS/Dashboards/WidgetHelpers", "Charts/Services"], function (WidgetHelpers, ChartService) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("BuildWarningsChartWidget", function () {
            var buildWarningsWidget = new BuildWarningsChart(WidgetHelpers, ChartService);
            return buildWarningsWidget;
        });
        VSS.notifyLoadSucceeded();
    });
    var BuildWarningsChart = (function () {
        function BuildWarningsChart(WidgetHelpers, ChartsServices) {
            this.WidgetHelpers = WidgetHelpers;
            this.ChartsServices = ChartsServices;
        }
        BuildWarningsChart.prototype.load = function (widgetSettings) {
            return this.showBuildWarnings(widgetSettings);
        };
        BuildWarningsChart.prototype.reload = function (widgetSettings) {
            return this.showBuildWarnings(widgetSettings);
        };
        BuildWarningsChart.prototype.showBuildWarnings = function (widgetSettings) {
            var _this = this;
            var customSettings = JSON.parse(widgetSettings.customSettings.data);
            var colSpan = widgetSettings.size.columnSpan;
            var rowSpan = widgetSettings.size.rowSpan;
            var height, widht;
            if (!customSettings) {
                customSettings = {
                    definitionId: null,
                    buildName: null
                };
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
                return buildClient.getBuilds(projectId, [customSettings.definitionId], undefined, undefined, undefined, undefined, undefined, undefined, undefined, buildFilter)
                    .then(function (builds) {
                    var warnings = [];
                    var dates = [];
                    var chain = Q.when();
                    var promises = [];
                    for (var i = builds.length - 1; i >= 0; i--) {
                        dates.push(builds[i].finishTime.toLocaleDateString('en-US'));
                        var buildId = builds[i].id;
                        var promise = buildClient.getBuildTimeline(projectId, buildId)
                            .then(function (details) {
                            var buildWarnings = 0;
                            for (var i = 0; i < details.records.length; i++) {
                                if (details.records[i].type == "Task") {
                                    buildWarnings = buildWarnings + details.records[i].warningCount;
                                }
                            }
                            return buildWarnings;
                        });
                        promises.push(promise);
                    }
                    return Q.all(promises).then(function (numbers) {
                        return _this.displayWidget(customSettings, numbers, dates, widht, height);
                    });
                }, function (reason) {
                    return _this.displayWidget(customSettings);
                });
            }
            catch (e) {
                console.log(e);
                return this.WidgetHelpers.WidgetStatusHelper.Failure(e.message);
            }
        };
        BuildWarningsChart.prototype.displayWidget = function (customSettings, warnings, dates, widht, height) {
            var _this = this;
            if (warnings === void 0) { warnings = undefined; }
            if (dates === void 0) { dates = undefined; }
            if (widht === void 0) { widht = "302"; }
            if (height === void 0) { height = "114"; }
            var $title = $("#widget-title");
            var $container = $("#Chart-Container");
            $container.empty();
            // Add build and count
            if (!customSettings.definitionId) {
                $container.text("No build selected.");
                return this.WidgetHelpers.WidgetStatusHelper.Success();
            }
            else if (!warnings) {
                $container.text("No data to plot.");
                return this.WidgetHelpers.WidgetStatusHelper.Success();
            }
            else {
                $title.text("Build warnings trend: " + customSettings.buildName);
                return this.ChartsServices.ChartsService.getService().then(function (chartSvc) {
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
                            }
                        ],
                        "xAxis": {
                            "labelFormatMode": "dateTime_DayInMonth",
                            "labelValues": dates
                        }
                    };
                    chartSvc.createChart($container, chartOptions);
                    return _this.WidgetHelpers.WidgetStatusHelper.Success();
                }, function (reason) {
                    return _this.WidgetHelpers.WidgetStatusHelper.Failure("Unable to get chart service.");
                });
            }
        };
        return BuildWarningsChart;
    })();
    exports.BuildWarningsChart = BuildWarningsChart;
});
//# sourceMappingURL=buildwarnings-chart.js.map