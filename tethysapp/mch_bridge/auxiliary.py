# import pywaterml.waterML as pwml
# import pandas as pd
import os

import re






WOF_URL = "http://128.187.106.131/app/index.php/dr/services/cuahsi_1_1.asmx?WSDL"
path_save = os.path.join(os.getcwd(), "sites.csv")



def stations_reload(df_p):
    try:
        new_df_sum = df_p[['StationName','Longitude','Latitude','Altitude','Longitude2','Latitude2','DMSlongitude','DMSLatitude']].copy()
        new_df_sum['latlng'] = new_df_sum.apply (lambda row: label_lat_long(row), axis=1)
        new_df_sum2 = new_df_sum[['StationName','latlng']].copy()
        new_df_sum2 = new_df_sum2[new_df_sum2['StationName'].notna()]

        df_dict = new_df_sum2.to_dict('records')
        return df_dict
    except Exception as e:
        print(e)

    return
def dms2dd(s):
    # example: s = """0°51'56.29"S"""
    degrees, minutes, seconds, direction = re.split('[°\'"]+', s)
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60);
    if direction in ('S','W'):
        dd*= -1
    return dd
def label_lat_long (row):
   if row['Longitude2'] != '' and row['Latitude2']  != '' :
      return [row['Longitude2'],row['Latitude2']]

   if row['DMSlongitude'] != '' and row['DMSLatitude'] != '' :
      return [dms2dd(row['DMSlongitude']),dms2dd(row['DMSLatitude'])]

   if row['Longitude'] != '' and row['Latitude']  != '':
      return ''

   return 'none'


def assign_names(df):
    df = df.rename(
        columns={
            "sitename": "StationName",
            "sitecode": "Station",
            "siteID": "StationName2",
        }
    )

    return df


def assign_coordinates(df):
    try:
        df = df.rename(columns={"latitude": "Latitude2", "longitude": "Longitude2"})
        df["DMSLatitude"] = df.apply(lambda x: decdeg2dms(x["Latitude2"]), axis=1)
        df["DMSLongitude"] = df.apply(lambda x: decdeg2dms(x["Longitude2"]), axis=1)
        df["Longitude"] = df.apply(
            lambda x: decdeg2dmstogether(x["Longitude2"]), axis=1
        )
        df["Latitude"] = df.apply(lambda x: decdeg2dmstogether(x["Latitude2"]), axis=1)
    except Exception as e:
        print(e)
    return df


def calculate_elevation():
    pass


def reConfigureDf(df):
    # Remove unnecessary columns first
    df.drop(columns=["fullSiteCode", "network"])
    # Add new columns to have the MCH format
    df["TimeZone"] = ""
    df["Altitude"] = ""
    df["Statee"] = ""
    df["RegManagmt"] = ""
    df["Catchment"] = ""
    df["Subcatchment"] = ""
    df["OperatnlRegion"] = ""
    df["HydroReg"] = ""
    df["RH"] = ""
    df["Municipality"] = ""
    df["CodeB"] = ""
    df["CodeG"] = ""
    df["CodeCB"] = ""
    df["CodePB"] = ""
    df["CodeE"] = ""
    df["CodeCL"] = ""
    df["CodeHG"] = ""
    df["CodePG"] = ""
    df["CodeNw"] = ""
    df["Code1"] = ""
    df["Code2"] = ""
    df["Code3"] = ""
    df["MaxOrdStrgLvl"] = ""
    df["MaxOrdStrgVol"] = ""
    df["MaxExtStrgLvl"] = ""
    df["MaxExtStrgVol"] = ""
    df["SpillwayLevel"] = ""
    df["SpillwayStorage"] = ""
    df["FreeSpillwayLevel"] = ""
    df["FreeSpillwayStorage"] = ""
    df["DeadStrgLevel"] = ""
    df["DeadStrgCapac"] = ""
    df["UsableStorageCapLev"] = ""
    df["UsableStorage"] = ""
    df["HoldingStorage"] = ""
    df["Key1fil"] = ""
    df["Key2fil"] = ""
    df["Key3fil"] = ""
    df["CritLevelSta"] = ""
    df["MinLevelSta"] = ""
    df["MaxLevelSta"] = ""
    df["CritFlow"] = ""
    df["MinDischarge"] = ""
    df["MaxDischarge"] = ""
    df["Stream"] = ""
    df["Distance"] = ""
    df["Infrastructure"] = ""
    df["Type"] = ""
    df["Usee"] = ""

    # Rearrange the columns
    df = df[
        [
            "Station",
            "StationName",
            "StationName2",
            "TimeZone",
            "Longitude",
            "Latitude",
            "Altitude",
            "Longitude2",
            "Latitude2",
            "DMSLongitude",
            "DMSLatitude",
            "Statee",
            "RegManagmt",
            "Catchment",
            "Subcatchment",
            "OperatnlRegion",
            "HydroReg",
            "RH",
            "Municipality",
            "CodeB",
            "CodeG",
            "CodeCB",
            "CodePB",
            "CodeE",
            "CodeCL",
            "CodeHG",
            "CodePG",
            "CodeNw",
            "Code1",
            "Code2",
            "Code3",
            "MaxOrdStrgLvl",
            "MaxOrdStrgVol",
            "MaxExtStrgLvl",
            "MaxExtStrgVol",
            "SpillwayLevel",
            "SpillwayStorage",
            "FreeSpillwayLevel",
            "FreeSpillwayStorage",
            "DeadStrgLevel",
            "DeadStrgCapac",
            "UsableStorageCapLev",
            "UsableStorage",
            "HoldingStorage",
            "Key1fil",
            "Key2fil",
            "Key3fil",
            "CritLevelSta",
            "MinLevelSta",
            "MaxLevelSta",
            "CritFlow",
            "MinDischarge",
            "MaxDischarge",
            "Stream",
            "Distance",
            "Infrastructure",
            "Type",
            "Usee",
        ]
    ]

    return df


def decdeg2dms(dd):
    if isinstance(dd, str):
        dd = float(dd)
    is_positive = dd >= 0
    dd = abs(dd)
    minutes, seconds = divmod(dd * 3600, 60)
    degrees, minutes = divmod(minutes, 60)
    degrees = degrees if is_positive else -degrees
    dms_degrees = f"{int(degrees)}°{int(minutes)}'{int(seconds)}''"
    return dms_degrees


def decdeg2dmstogether(dd):
    if isinstance(dd, str):
        dd = float(dd)
    is_positive = dd >= 0
    dd = abs(dd)
    minutes, seconds = divmod(dd * 3600, 60)
    degrees, minutes = divmod(minutes, 60)
    degrees = degrees if is_positive else -degrees
    dms_degrees = f"{int(degrees)}{int(minutes)}{int(seconds)}"
    return dms_degrees


# def _convert__WOFstations(WOF_URL):
#     """
#     Method to convert WOF GetSites response to a .csv file that can be used to
#     upload data to the MCH Database.
#     """

#     try:
#         water = pwml.WaterMLOperations(url = WOF_URL)
#         sites = water.GetSites()
#         df = pd.DataFrame.from_dict(sites)
#         #Change the names of the station columns and sitecodes, and siteIDs"
#         df = assign_names(df)
#         df = assign_coordinates(df)
#         df = reConfigureDf(df)
#         #Save as a pandas dataFrame
#         # df.to_csv(path_save, index=False)
#     except Exception as e:
#         print(e)

#     pass
