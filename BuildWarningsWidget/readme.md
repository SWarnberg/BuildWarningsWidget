The **Build Warnings** widgets shows the number of build warnings produced for a specific build. This includes Code Analysis warnings as well as compile-time warnings.
### Last builds warnings ###
The **Build Warnings** widget shows the number of warnings produced by the latest build for a specific build definiton.

![](static/images/preview2.png)
### Build warnings trend ###
The **Build warnings trend** widget shows the number of build warnings for all historical build for a specific build definition.

![](static/images/LargePreview.png)
### Notes about implementation ###
These widgets was developed since vNext builds aren't publishing statistics to the TFS warehouse database anymore, and since VSTS doesn't support 
warehouse at all.  
This means that the data extracted is taken from existing builds. Hence, it's only retained builds that contribute to the data. If you want to 
see a trend over a longer time, make sure to retain builds manually.
### Contribute ###
The source code for these widgets are available at [GitHub](https://github.com/SWarnberg/BuildWarningsWidget). Please Fork and contribute!