# import pywaterml.waterML as pwml
import asyncio
from cmath import log
import os
import aiomysql
import pandas as pd
from django.http.response import JsonResponse
from django.shortcuts import render, redirect, reverse
from tethys_sdk.permissions import login_required
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .app import MchBridge as app
import sqlalchemy as db
import pymysql
# from sqlalchemy import create_engine, MetaData
from sqlalchemy.exc import OperationalError, ProgrammingError


from sqlalchemy.orm import sessionmaker

from random import randint

@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, "mch_bridge/home.html", context)

@login_required()
def stations(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/stations.html", context)
@login_required()
def groupStations(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/groupStations.html", context)
@login_required()
def variableStationTypes(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/variableStationTypes.html", context)
@login_required()
def timeSeries(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/timeSeries.html", context)
@login_required()
def instructions(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, "mch_bridge/instructions.html", context)


def upload__files(request):
    upload_type = request.POST.get("type_upload")
    csv_file = request.FILES.getlist("csv_file", None)
    # new_file_path = os.path.join(app_workspace.path)     
    app_workspace_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "workspaces", "app_workspace"
    )
    respose_list = []
    for csv_indv in csv_file:
        df = pd.read_csv(csv_indv, index_col=False, dtype="str")
        df.to_csv(os.path.join(app_workspace_path,csv_indv.name),index=False)
        id_html = csv_indv.name.replace('.','_').replace(" ", "_") + str(randint(0, 100))
        respose_single = {
            "file":csv_indv.name,
            "count":len(df),
            "id":id_html
        }
        respose_list.append(respose_single)

    return JsonResponse({"data":respose_list})

def upload__data(upload_type, csv_file,ids, channel_layer):
    
    """
    Method to upload Stations to the MCH Database.
    """
    res_obj = {}
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "notifications", {
            "type": "simple_notifications",
            "message": "Uploading process starting . . .",
        }
    )

    try:
        # upload_type = request.POST.get("type_upload")
        # csv_file = request.FILES.getlist("csv_file", None)
        print(csv_file)
        print("pomo")

        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file,ids))
        # loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))

        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        print(e, "opa")
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database .."

    # return JsonResponse(res_obj)
    # pass


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

#     passcsv_file


async def upload_data_tables(cur, table_name, csv_file,ids):
    host_db = app.get_custom_setting("Database host")
    port_db = app.get_custom_setting("Database Port")
    user_db = app.get_custom_setting("Database User")
    password_db = app.get_custom_setting("Database Password")
    db_name = app.get_custom_setting("Database Name")
    engine = db.create_engine(f'mysql+pymysql://{user_db}:{password_db}@{host_db}:{port_db}/{db_name}')
    database_metadata = db.MetaData(bind=engine)
    database_metadata.reflect()
    Session = sessionmaker(bind=engine)
    session = Session()
    channel_layer = get_channel_layer()
    status_type = "in process"
    app_workspace_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "workspaces", "app_workspace"
    )
    total_count = 0
    mssge_string = "success"
    try:
        print(table_name)
        for csv_indv,csv_id in zip(csv_file,ids):
            print(table_name)
            table_name_insert = table_name
            path_to_read = os.path.join(app_workspace_path,csv_indv)
            df = pd.read_csv(path_to_read, index_col=False, dtype="str")
            # df = pd.read_csv(csv_indv, index_col=False, dtype="str")
            if "table_name" in df.columns and table_name_insert == "timeSeries":
                print("ey")
                table_name_insert = df["table_name"][0]
                df = df.drop("table_name", 1)
            actual_data_count = session.execute(f'SELECT COUNT(*)FROM {table_name};').scalar()
            print("datacount",actual_data_count)
            total_count = len(df)
            await channel_layer.group_send(
                "notifications", {
                    "type": "data_notifications",
                    "count": 0,
                    "total": total_count,
                    "status": status_type,
                    "file": csv_file,
                    "id":csv_id,
                    "mssg": mssge_string
                }
            )
            df = df.where(pd.notnull(df), None)
            print("ey2")
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
            new_data_count = session.execute(f'SELECT COUNT(*)FROM {table_name_insert};').scalar()
            summary_data_count = new_data_count - actual_data_count
            if summary_data_count == total_count:
                status_type = "complete"
                print(new_data_count,actual_data_count)

                await channel_layer.group_send(
                    "notifications", {
                        "type": "data_notifications",
                        "count": summary_data_count,
                        "total": total_count,
                        "status": status_type,
                        "file": csv_file,
                        "id":csv_id,
                        "mssg": mssge_string
                    }
                )       
    except pymysql.IntegrityError as e:
        if e.args[0] == 1062:
            new_data_count = session.execute(f'SELECT COUNT(*)FROM {table_name};').scalar()
            summary_data =  new_data_count - actual_data_count
            print(new_data_count,summary_data)
            # summary_data = abs(actual_data_count - total_count)
            status_type = "Failed"
            mssge_string = "The file contains stations that are already in the database"
            # if new_data_count == actual_data_count:
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "notifications", {
                    "type": "data_notifications",
                    "count": summary_data,
                    "total": total_count,
                    "status": status_type,
                    "file": csv_file,
                    "id":csv_id,
                    "mssg": mssge_string
                }
            )
    except ProgrammingError as e:
        mssge_string = str(e.args[0])

        print("programming")
        if "1146" in e.args[0]:
            new_data_count = 0
            actual_data_count = 0
            mssge_string = "Table does not exits"
        else:
            new_data_count = session.execute(f'SELECT COUNT(*)FROM {table_name};').scalar()

        summary_data =  new_data_count - actual_data_count
        print(new_data_count,summary_data)
        # summary_data = abs(actual_data_count - total_count)
        status_type = "Failed"
        # if new_data_count == actual_data_count:
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "notifications", {
                "type": "data_notifications",
                "count": summary_data,
                "total": total_count,
                "status": status_type,
                "file": csv_file,
                "id":csv_id,
                "mssg": mssge_string
            }
        )
                    
    except Exception as e:
        print("new excpetion")
        print(type(e))

        new_data_count = session.execute(f'SELECT COUNT(*)FROM {table_name};').scalar()
        summary_data =  new_data_count - actual_data_count
        # summary_data = abs(actual_data_count - total_count)
        status_type = "Failed"
        mssge_string = str(e)

        # if new_data_count == actual_data_count:
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "notifications", {
                "type": "data_notifications",
                "count": summary_data,
                "total": total_count,
                "status": status_type,
                "file": csv_file,
                "id":csv_id,
                "mssg": mssge_string


            }
        )       


async def quicker_upload(loop, table_name, csv_file,ids):
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
            await upload_data_tables(cur, table_name, csv_file,ids)
    pool.close()
    await pool.wait_closed()
