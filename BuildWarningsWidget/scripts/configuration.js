/// <reference path="../typings/index.d.ts" />
/// <reference path="isettings.ts" />
/// <reference path='../typings/index.d.ts' />
define(["require", "exports", "TFS/Build/RestClient"], function (require, exports, Build_Client) {
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("BuildWarningsWidget.Configuration", function () {
            var configuration = new Configuration(WidgetHelpers);
            return configuration;
        });
        VSS.notifyLoadSucceeded();
    });
    var Configuration = (function () {
        function Configuration(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
            this.widgetConfigurationContext = null;
            this.$select = $('select');
            this.$backgroundColor = $("#background-color-input");
            this.$foregroundColor = $("#foreground-color-input");
        }
        Configuration.prototype.load = function (widgetSettings, widgetConfigurationContext) {
            var _this = this;
            var _that = this; // ??
            this.widgetConfigurationContext = widgetConfigurationContext;
            var settings = JSON.parse(widgetSettings.customSettings.data);
            this.showBuilds(settings);
            this.showColorPickers(settings);
            //VSS.resize();
            // Change notification
            this.$select.add(this.$backgroundColor).add(this.$foregroundColor).change(function () {
                _this.widgetConfigurationContext.notify(_this.WidgetHelpers.WidgetEvent.ConfigurationChange, _this.WidgetHelpers.WidgetEvent.Args(_this.getCustomSettings()));
            });
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        Configuration.prototype.onSave = function () {
            var isValid = true;
            if (isValid) {
                return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
            }
            else {
                return this.WidgetHelpers.WidgetConfigurationSave.Invalid();
            }
        };
        Configuration.prototype.showBuilds = function (settings) {
            var _this = this;
            // Get the available builds.
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
        Configuration.prototype.showColorPickers = function (settings) {
            //var palette = [
            //  ['black', 'white', 'tan', 'turquoise', 'pink'],
            //  ['red', 'yellow', 'green', 'blue', 'violet']
            //]
            var palette = [
                ['rgb(34, 34, 34);', 'rgb(41, 46, 107);', 'rgb(0, 156, 204);', 'rgb(0, 100, 58);', 'rgb(51, 153, 71);', 'rgb(251, 188, 61);', 'rgb(219, 85, 44);', 'rgb(127, 23, 37);', 'rgb(236, 0, 140);', 'rgb(92, 25, 123);', 'rgb(81, 57, 159);'],
                ['white', 'rgb(0, 122, 204);', 'rgb(201, 231, 231);', 'rgb(124, 175, 154);', 'rgb(168, 206, 75);', 'rgb(251, 253, 82);', 'rgb(247, 162, 75);', 'rgb(230, 0, 23);', 'rgb(245, 153, 209);', 'rgb(174, 136, 185);', 'rgb(170, 156, 223);']
            ];
            var colorSettings = {
                color: "",
                showPaletteOnly: true,
                showPalette: true,
                hideAfterPaletteSelect: true,
                palette: palette
            };
            colorSettings.color = (settings && settings.backgroundColor) ? settings.backgroundColor : "rgb(0, 156, 204);";
            this.$backgroundColor.spectrum(colorSettings);
            colorSettings.color = (settings && settings.foregroundColor) ?
                settings.foregroundColor
                : "white";
            this.$foregroundColor.spectrum(colorSettings);
        };
        Configuration.prototype.getCustomSettings = function () {
            var foregroundColor = this.$foregroundColor.spectrum("get").toRgbString();
            var backgroundColor = this.$backgroundColor.spectrum("get").toRgbString();
            var build = this.$select.val();
            var name = $("#build-dropdown option:selected").text();
            var result = {
                data: JSON.stringify({
                    foregroundColor: foregroundColor,
                    backgroundColor: backgroundColor,
                    definitionId: build,
                    buildName: name
                })
            };
            return result;
        };
        return Configuration;
    })();
    exports.Configuration = Configuration;
});
//# sourceMappingURL=configuration.js.map