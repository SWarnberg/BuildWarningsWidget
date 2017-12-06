/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />
/// <reference path='../typings/index.d.ts' />
define(["require", "exports", "TFS/Build/RestClient"], function (require, exports, Build_Client) {
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("BuildWarningsChartWidget.Configuration", function () {
            var configuration = new ChartConfiguration(WidgetHelpers);
            return configuration;
        });
        VSS.notifyLoadSucceeded();
    });
    var ChartConfiguration = (function () {
        function ChartConfiguration(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
            this.widgetConfigurationContext = null;
            this.$select = $('select');
        }
        ChartConfiguration.prototype.load = function (widgetSettings, widgetConfigurationContext) {
            var _this = this;
            var _that = this; // ??
            this.widgetConfigurationContext = widgetConfigurationContext;
            var settings = JSON.parse(widgetSettings.customSettings.data);
            this.showBuilds(settings);
            //VSS.resize();
            // Change notification
            this.$select.change(function () {
                _this.widgetConfigurationContext.notify(_this.WidgetHelpers.WidgetEvent.ConfigurationChange, _this.WidgetHelpers.WidgetEvent.Args(_this.getCustomSettings()));
            });
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        ChartConfiguration.prototype.onSave = function () {
            var isValid = true;
            if (isValid) {
                return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
            }
            else {
                return this.WidgetHelpers.WidgetConfigurationSave.Invalid();
            }
        };
        ChartConfiguration.prototype.showBuilds = function (settings) {
            var _this = this;
            var projectId = VSS.getWebContext().project.id;
            Build_Client.getClient().getDefinitions(projectId).then(function (definitions) {
                for (var i = 0; i < definitions.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = definitions[i].id.toString();
                    opt.innerHTML = definitions[i].name;
                    _this.$select[0].appendChild(opt);
                }
            });
            // Select the configured build, or default
            if (settings && settings.definitionId) {
                this.$select.val(settings.definitionId);
            }
        };
        ChartConfiguration.prototype.getCustomSettings = function () {
            var build = this.$select.val();
            var name = $("#build-dropdown option:selected").text();
            var result = {
                data: JSON.stringify({
                    definitionId: build,
                    buildName: name
                })
            };
            return result;
        };
        return ChartConfiguration;
    })();
    exports.ChartConfiguration = ChartConfiguration;
});
//# sourceMappingURL=configuration-chart.js.map