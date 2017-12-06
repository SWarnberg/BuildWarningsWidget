/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />
define(["require", "exports", "TFS/Build/RestClient", "TFS/Build/Contracts"], function (require, exports, Build_Client, Build_Contracts) {
    //import Combos = require("VSS/Controls/Combos");
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("BuildWarningsWidget", function () {
            var buildWarningsWidget = new BuildWarningsWidget(WidgetHelpers);
            return buildWarningsWidget;
        });
        VSS.notifyLoadSucceeded();
    });
    var BuildWarningsWidget = (function () {
        function BuildWarningsWidget(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
        }
        BuildWarningsWidget.prototype.load = function (widgetSettings) {
            return this.showBuildWarnings(widgetSettings);
        };
        BuildWarningsWidget.prototype.reload = function (widgetSettings) {
            return this.showBuildWarnings(widgetSettings);
        };
        BuildWarningsWidget.prototype.showBuildWarnings = function (widgetSettings) {
            var _this = this;
            var customSettings = JSON.parse(widgetSettings.customSettings.data);
            if (!customSettings) {
                customSettings = {
                    backgroundColor: "rgb(0, 156, 204);",
                    foregroundColor: "white",
                    definitionId: null,
                    buildName: null
                };
                return this.displayWidget(customSettings, 0, null);
            }
            try {
                var buildWarnings = 0;
                var projectId = VSS.getWebContext().project.id;
                var buildFilter = Build_Contracts.BuildResult.Succeeded;
                var buildClient = Build_Client.getClient();
                return buildClient.getBuilds(projectId, [customSettings.definitionId], undefined, undefined, undefined, undefined, undefined, undefined, undefined, buildFilter).then(function (builds) {
                    if (builds.length > 0) {
                        var buildId = builds[0].id;
                        var link = builds[0]._links.web.href;
                        return buildClient.getBuildTimeline(projectId, buildId).then(function (details) {
                            for (var i = 0; i < details.records.length; i++) {
                                if (details.records[i].type == "Task") {
                                    buildWarnings = buildWarnings + details.records[i].warningCount;
                                }
                            }
                            return _this.displayWidget(customSettings, buildWarnings, link);
                        }, function (reason) {
                            return _this.displayWidget(customSettings, 0, link);
                        });
                    }
                    else {
                        buildWarnings = 0;
                        return _this.displayWidget(customSettings, buildWarnings, null);
                    }
                }, function (reason) {
                    return _this.displayWidget(customSettings, 0, null);
                });
            }
            catch (e) {
                console.log(e);
                return this.WidgetHelpers.WidgetStatusHelper.Failure(e.message);
            }
        };
        BuildWarningsWidget.prototype.displayWidget = function (customSettings, warnings, uri) {
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
        };
        return BuildWarningsWidget;
    })();
    exports.BuildWarningsWidget = BuildWarningsWidget;
});
//# sourceMappingURL=buildwarnings.js.map