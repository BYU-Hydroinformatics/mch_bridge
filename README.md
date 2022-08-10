<p align="center">
<img align= "center" src="https://drive.google.com/uc?export=view&id=1VODc4nvMDsI33R_OyIQ38QWpB_sfZitB" width="20%" height="20%"/>
</p>

<h1 align="center"> MCH Bridge </h1>

<p align="center">
<img align= "center" src="https://img.shields.io/badge/license-BSD%203--Clause-yellow.svg" width="20%" height="20%"/>
</p>

## Why Adopting the MCH Bridge

The MCH bridge is an application that allows users to upload multiple files to an MCH database such as (stations, station groups, variable station types, and time series). This is a great advantage if the user would want to upload a .csv file containing all the stations or if multiple time series for different variables would want to be upload at once.

The application MCH bridge allows users to upload and preview csv files of:

1. Stations

2. Station Groups

3. Variable Types Stations

4. Time Series (e.g. detail, daily data)

## Overview

There are two main menus: MCH Database Tables and Data menus

MCH Database Tables Menu provides information about the data in the MCH instance that is connected to the app while the Data menu allows to upload and preview data in each of the MCH tables of the MCH Database Tables Menu.

### MCH Database Tables Menu

MCH Database Tables Menu provides information about the data in the MCH instance that is connected to the app while the Data menu allows to upload and preview data in each of the MCH tables of the MCH Database Tables Menu.

1. **Stations Tab**: Provides visualization and total count of the current stations found in the MCH instance (specifically in the stations table)

1. **Stations Group Tab**: Provides a summary table with a count of the stations in the different station groups

1. **Variable Station Types Tab**: Provides a summary table with a count of the station groups in the different variable station types

1. **Time Series Tab**: Provides a total count of data points and table details for the variable tables containing data

### Data Menu

The Data menu allows to upload data asynchronously using a the right data menu (through web sockets and django channels)

Data is uploaded to an MCH instance concurrently, and the user can track the progress of the upload.

Only time series data uploading allows for multiple csv files. Data uploading of Stations, Station groups, and variable station types only allows one csv file at a time.

Similarly data can be previewed for the different data files:

1. **Stations**: Data file containing stations can be previewed in a map that shows the name of the each stations after clicking on each of them.

1. **Station Groups and Variable Types Stations**: Data file containing stations groups or variable types stations are previewed by providing a table with the content of the file.

1. **Time Series**: Data files for each time series are plotted in order to be previewed.

## Data Preparation

The CSV files must have the following header columns for the stations, station groups, variable types stations, and time series tables. Otherwise, data will not be uplaoded properly.Sample files can be found [here](https://github.com/BYU-Hydroinformatics/mch_bridge/tree/main/tethysapp/mch_bridge/data_test) for the different tables

### Stations

The data file containing the stations data should have the following columns

StationName2, Longitude, Latitude, Altitude, Longitude2, Latitude2, DMSLongitude, DMSLatitude, Statee, Catchment, Subcatchment, RegManagmt, OperatnlRegion, HydroReg, RH, Municipality, CodeB, CodeG, CodeCB, CodePB, CodeE, CodeCL, CodeHG, CodePG, CodeNw, Code1, Code2, Code3, MaxOrdStrgLvl, MaxOrdStrgVol, MaxExtStrgLvl, MaxExtStrgVol, SpillwayLevel, SpillwayStorage, FreeSpillwayLevel, FreeSpillwayStorage, DeadStrgLevel, DeadStrgCapac, UsableStorageCapLev, UsableStorage, Key1fil, Key2fil, Key3fil, CritLevelSta, CritLevelSta, MinLevelSta, MaxLevelSta, CritFlow, MinDischarge, MaxDischarge, Distance, Infrastructure, Type, Usee

### Stations Groups

The data file containing the stations groups data should have the following columns

1. StnGroup

1. Sequen

1. Station

### Variable Types Stations

The data file containing the variable types stations data should have the following columns

1. StationType

1. Sequen

1. Variable

### Time Series

The data files containing the time series might have different columns, but all of them should have a column called **table_name** with at least the first cell containing the name of the table to insert in the MCH database. For example, for daily precipitation data the name of the table is **ddprecipitation**.

**_It is strongly suggested that the user knows the name of the table associated with the type of variable that one wants to uploads_**

## Built With

- [Tethys Platform](http://docs.tethysplatform.org/en/stable/index.html) - The web framework used

## Contributing

Please feel free to clone the repo and contribute to it :)

## Authors

- **Elkin Giovanni Romero** - [romer8](https://github.com/romer8)

## License

This project is licensed under the BSD 3-Clause License
