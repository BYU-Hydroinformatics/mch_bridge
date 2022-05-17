# import pywaterml.waterML as pwml
import asyncio

import aiomysql
import pandas as pd
from django.http.response import JsonResponse
from django.shortcuts import render
from tethys_sdk.permissions import login_required
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .app import MchBridge as app


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/home.html", context)


def upload__data(request):
    """
    Method to upload Stations to the MCH Database.
    """
    print("upload_data")
    res_obj = {}
    try:
        upload_type = request.POST.get("type_upload")
        csv_file = request.FILES.getlist("csv_file", None)
        print(csv_file)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))
        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        print(e)
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database .."

    return JsonResponse(res_obj)


def upload__stations(request):
    """
    Method to upload Stations to the MCH Database.
    """
    res_obj = {}
    try:
        upload_type = request.POST.get("type_upload")
        csv_file = request.FILES.get("csv_file", None)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))
        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database:" + str(e)

    return JsonResponse(res_obj)


def upload__stnGroups(request):
    """
    Method to upload Stations Groups to the MCH Database.
    """
    res_obj = {}
    try:
        upload_type = request.POST.get("type_upload")
        csv_file = request.FILES.get("csv_file", None)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))
        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database:" + str(e)

    return JsonResponse(res_obj)


def upload__variableStnTypes(request):
    """
    Method to upload Variable Station Types to the MCH Database.
    """
    res_obj = {}
    try:
        upload_type = request.POST.get("type_upload")
        csv_file = request.FILES.get("csv_file", None)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))
        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database:" + str(e)

    return JsonResponse(res_obj)


def upload__timeSeries(request):
    """
    Method to upload Time Series to the MCH Database.
    """

    pass


# def convert__WOFstations(request):
#     """
#     Method to convert WOF GetSites response to a .csv file that can be used to
#     upload data to the MCH Database.
#     """

#     try:
#         WOF_URL = request.GET.get('wof_url')

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


async def upload_data_tables(cur, table_name, csv_file):

    for csv_indv in csv_file:
        print(table_name)
        table_name_insert = table_name
        df = pd.read_csv(csv_indv, index_col=False, dtype="str")
        if "table_name" in df.columns and table_name_insert == "timeSeries":
            print("ey")
            table_name_insert = df["table_name"][0]
            df = df.drop("table_name", 1)
        df = df.where(pd.notnull(df), None)
        print(df)
        columns = list(df.columns.values)
        columns_string = ", ".join(columns)
        print(len(columns))
        print(columns_string)
        placeholders = ", ".join(["%s"] * len(columns))
        print(len(placeholders))
        records_tuple = df.to_records(index=False)
        records_list_tuples = list(records_tuple)
        records_list_tuples = [tuple(i) for i in records_list_tuples]
        sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % (
            table_name_insert,
            columns_string,
            placeholders,
        )
        print(sql)
        await cur.executemany(sql, records_list_tuples)


async def quicker_upload(loop, table_name, csv_file):
    host_db = app.get_custom_setting("Database host")
    port_db = app.get_custom_setting("Database Port")
    user_db = app.get_custom_setting("Database User")
    password_db = app.get_custom_setting("Database Password")
    db_name = app.get_custom_setting("Database Name")

    pool = await aiomysql.create_pool(
        host=host_db,
        port=int(port_db),
        user=user_db,
        password=password_db,
        db=db_name,
        loop=loop,
    )
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await upload_data_tables(cur, table_name, csv_file)
    pool.close()
    await pool.wait_closed()
