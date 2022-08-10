import asyncio
import json
import os
from random import randint

import aiomysql
import pandas as pd
import pymysql
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http.response import JsonResponse
from django.shortcuts import render
from sqlalchemy.exc import ProgrammingError
from tethys_sdk.permissions import login_required

from .app import MchBridge as app
from .auxiliary import stations_reload
from .single_db import Database
from django.core.serializers.json import DjangoJSONEncoder


@login_required()
def get_stations_var(request):

    station_selected = request.POST.get("variable")
    response_obj = {}
    mydb = Database()
    query_string = f"SELECT * FROM {station_selected};"
    df = mydb.df_from_execute_statement(query_string)
    print(df)
    if df.empty:
        df['Station'] = []
    df_grouped_by_station = df.groupby(["Station"]).size().reset_index(name="totals")

    # print(df_grouped_by_station)
    response_obj = {"list_stations": df_grouped_by_station.to_dict(orient="records")}
    # print(response_obj)

    return JsonResponse(response_obj)


@login_required()
def home(request):
    """
    Controller for the app home page.
    """
    try:
        mydb = Database()
        query_string = "SELECT * FROM stations;"
        df = mydb.df_from_execute_statement(query_string)
        print(df)
        df = df[df["Station"].notna()]

        df_dict_string2 = {}

        if len(df) > 0:
            new_dict_df = stations_reload(df)
            df_dict_string2 = json.dumps(new_dict_df)

        total_count_dict = {"Total Number of Stations": len(df)}
        df_dict_string = json.dumps(total_count_dict)

        context = {
            "isStationView": True,
            "summary_data": df_dict_string,
            "plot_data": df_dict_string2,
        }
        return render(request, "mch_bridge/stations.html", context)
    except Exception as e:
        print(e)
        context = {"isStationView": True, "summary_data": {}, "plot_data": {}}
        return render(request, "mch_bridge/stations.html", context)


@login_required()
def stations(request):
    """
    Controller for the app home page.
    """
    try:
        mydb = Database()
        query_string = "SELECT * FROM stations;"
        df = mydb.df_from_execute_statement(query_string)
        df = df[df["Station"].notna()]

        df_dict_string2 = {}

        if len(df) > 0:
            new_dict_df = stations_reload(df)
            df_dict_string2 = json.dumps(new_dict_df)

        total_count_dict = {"Total Number of Stations": len(df)}
        df_dict_string = json.dumps(total_count_dict)

        context = {
            "isStationView": True,
            "summary_data": df_dict_string,
            "plot_data": df_dict_string2,
        }

        return render(request, "mch_bridge/stations.html", context)
    except Exception as e:
        print(e)
        context = {"isStationView": True, "summary_data": {}, "plot_data": {}}
        return render(request, "mch_bridge/stations.html", context)


@login_required()
def groupStations(request):
    """
    Controller for the app home page.
    """

    try:
        mydb = Database()
        query_string = "SELECT * FROM stngroups;"
        df = mydb.df_from_execute_statement(query_string)
        df = df[df["StnGroup"].notna()]

        df_count = df["StnGroup"].value_counts()
        # print(df_count)
        df_dict = df_count.to_dict()
        df_dict_string = json.dumps(df_dict)
        # df_dict_string={}
        context = {"summary_data": df_dict_string}

        return render(request, "mch_bridge/groupStations.html", context)
    except Exception as e:
        print(e)
        context = {"summary_data": {}}
        return render(request, "mch_bridge/groupStations.html", context)


@login_required()
def variableStationTypes(request):
    """
    Controller for the app home page.
    """

    try:
        mydb = Database()
        query_string = "SELECT * FROM variablestationtype;"
        df = mydb.df_from_execute_statement(query_string)
        df = df[df["StationType"].notna()]

        df_count = df["StationType"].value_counts()
        # print(df_count)
        df_dict = df_count.to_dict()
        df_dict_string = json.dumps(df_dict)

        context = {"summary_data": df_dict_string}

        return render(request, "mch_bridge/variableStationTypes.html", context)
    except Exception as e:
        print(e)
        context = {"summary_data": {}}
        return render(request, "mch_bridge/variableStationTypes.html", context)


@login_required()
def timeSeries(request):
    """
    Controller for the app home page.
    """
    try:
        sql_query = "SELECT table_name, sum(table_rows) FROM information_schema.tables WHERE table_name like 'da_%' or table_name like 'dc_%' or table_name like 'dd_%' or table_name like 'de_%' or table_name like 'dm_%' or table_name like 'ds_%' or table_name like 'na_%' or table_name like 'nc_%' or table_name like 'nd_%' or table_name like 'nm_%' or table_name like 'ns_%' AND TABLE_SCHEMA = 'mch'  GROUP BY TABLE_NAME;"
        exclude_list = [
            "data_locks",
            "data_lock_waits",
            "default_roles",
            "ddavailability",
        ]

        # actual_data_rows = session.execute(sql_query)
        # result = [dict(row) for row in actual_data_rows]
        # df = pd.DataFrame(result)
        mydb = Database()
        df = mydb.df_from_execute_statement(sql_query)
        df.columns = map(str.lower, df.columns)

        # print(df)
        mycolrow = "sum(table_rows)"

        mycolname = "table_name"

        df_with_vals = df.loc[df[mycolrow] > 0]
        df_excluded_tables = df_with_vals.loc[
            ~df_with_vals[mycolname].isin(exclude_list)
        ]

        # print(df)
        # print(df_excluded_tables)

        df_dict = df_excluded_tables.to_dict(orient="list")
        df_dict_string = json.dumps(df_dict,cls=DjangoJSONEncoder)
        print(df_dict_string)

        context = {"summary_data": df_dict_string}

        return render(request, "mch_bridge/timeSeries.html", context)
    except Exception as e:
        print(e)
        context = {"summary_data": {}}
        return render(request, "mch_bridge/timeSeries.html", context)


def upload__files(request):
    # upload_type = request.POST.get("type_upload")
    csv_file = request.FILES.getlist("csv_file", None)
    # new_file_path = os.path.join(app_workspace.path)
    app_workspace_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "workspaces", "app_workspace"
    )
    respose_list = []
    for csv_indv in csv_file:
        df = pd.read_csv(csv_indv, index_col=False, dtype="str")
        df.to_csv(os.path.join(app_workspace_path, csv_indv.name), index=False)
        id_html = csv_indv.name.replace(".", "_").replace(" ", "_") + str(
            randint(0, 100)
        )
        respose_single = {"file": csv_indv.name, "count": len(df), "id": id_html}
        respose_list.append(respose_single)

    return JsonResponse({"data": respose_list})


def upload__data(upload_type, csv_file, ids, channel_layer):

    """
    Method to upload Stations to the MCH Database.
    """
    res_obj = {}
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "notifications",
        {
            "type": "simple_notifications",
            "message": "Uploading process starting . . .",
        },
    )

    try:
        # upload_type = request.POST.get("type_upload")
        # csv_file = request.FILES.getlist("csv_file", None)
        # print(csv_file)

        loop = asyncio.get_event_loop()
        loop.run_until_complete(quicker_upload(loop, upload_type, csv_file, ids))
        # loop.run_until_complete(quicker_upload(loop, upload_type, csv_file))

        res_obj["success"] = "data is being uploaded .."

    except Exception as e:
        print(e, "opa")
        res_obj[
            "error"
        ] = "an error ocurred while uploading the data in the database .."

    # return JsonResponse(res_obj)
    # pass


async def upload_data_tables(cur, table_name, csv_file, ids):
    # host_db = app.get_custom_setting("Database host")
    # port_db = app.get_custom_setting("Database Port")
    # user_db = app.get_custom_setting("Database User")
    # password_db = app.get_custom_setting("Database Password")
    # db_name = app.get_custom_setting("Database Name")
    # engine = db.create_engine(f'mysql+pymysql://{user_db}:{password_db}@{host_db}:{port_db}/{db_name}')
    # database_metadata = db.MetaData(bind=engine)
    # database_metadata.reflect()
    # Session = sessionmaker(bind=engine)
    # session = Session()
    mydb = Database()
    session = mydb.session
    channel_layer = get_channel_layer()
    status_type = "in process"
    app_workspace_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "workspaces", "app_workspace"
    )
    total_count = 0
    mssge_string = "success"
    # print(table_name)
    for csv_indv, csv_id in zip(csv_file, ids):
        try:
            # print(table_name)
            table_name_insert = table_name
            path_to_read = os.path.join(app_workspace_path, csv_indv)
            df = pd.read_csv(path_to_read, index_col=False, dtype="str")
            # df = pd.read_csv(csv_indv, index_col=False, dtype="str")
            if "table_name" in df.columns and table_name_insert == "timeSeries":
                # print("ey")
                table_name_insert = df["table_name"][0]
                # print(table_name_insert)
                df = df.drop("table_name", 1)
            actual_data_count = session.execute(
                f"SELECT COUNT(*)FROM {table_name_insert};"
            ).scalar()
            # print("datacount",actual_data_count)
            total_count = len(df)
            await channel_layer.group_send(
                "notifications",
                {
                    "type": "data_notifications",
                    "count": 0,
                    "total": total_count,
                    "status": status_type,
                    "file": csv_indv,
                    "id": csv_id,
                    "mssg": mssge_string,
                },
            )
            # print(df)
            df = df.where(pd.notnull(df), None)
            # print("ey2")
            # print(df)
            columns = list(df.columns.values)
            columns_string = ", ".join(columns)
            # print(len(columns))
            # print(columns_string)
            placeholders = ", ".join(["%s"] * len(columns))
            # print(len(placeholders))
            records_tuple = df.to_records(index=False)
            records_list_tuples = list(records_tuple)
            records_list_tuples = [tuple(i) for i in records_list_tuples]
            # print(table_name_insert)
            sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % (
                table_name_insert,
                columns_string,
                placeholders,
            )
            # print(sql)
            await cur.executemany(sql, records_list_tuples)
            new_data_count = session.execute(
                f"SELECT COUNT(*)FROM {table_name_insert};"
            ).scalar()
            summary_data_count = new_data_count - actual_data_count
            # print(summary_data_count,total_count)

            if summary_data_count == total_count:
                status_type = "complete"
                # print(new_data_count,actual_data_count)

                await channel_layer.group_send(
                    "notifications",
                    {
                        "type": "data_notifications",
                        "count": summary_data_count,
                        "total": total_count,
                        "status": status_type,
                        "file": csv_indv,
                        "id": csv_id,
                        "mssg": mssge_string,
                    },
                )
        except pymysql.IntegrityError as e:
            if e.args[0] == 1062:
                new_data_count = session.execute(
                    f"SELECT COUNT(*)FROM {table_name_insert};"
                ).scalar()
                summary_data = new_data_count - actual_data_count
                # print(new_data_count,summary_data)
                # summary_data = abs(actual_data_count - total_count)
                status_type = "Failed"
                mssge_string = "The file contains data that is already in the database"
                # if new_data_count == actual_data_count:
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    "notifications",
                    {
                        "type": "data_notifications",
                        "count": summary_data,
                        "total": total_count,
                        "status": status_type,
                        "file": csv_indv,
                        "id": csv_id,
                        "mssg": mssge_string,
                    },
                )
        except ProgrammingError as e:
            mssge_string = str(e.args[0])

            # print("programming")
            if "1146" in e.args[0]:
                new_data_count = 0
                actual_data_count = 0
                mssge_string = "Table does not exits"
            else:
                new_data_count = session.execute(
                    f"SELECT COUNT(*)FROM {table_name_insert};"
                ).scalar()

            summary_data = new_data_count - actual_data_count
            # print(new_data_count,summary_data)
            # summary_data = abs(actual_data_count - total_count)
            status_type = "Failed"
            # if new_data_count == actual_data_count:
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "notifications",
                {
                    "type": "data_notifications",
                    "count": summary_data,
                    "total": total_count,
                    "status": status_type,
                    "file": csv_indv,
                    "id": csv_id,
                    "mssg": mssge_string,
                },
            )

        except Exception as e:
            print("new excpetion")
            print(type(e))

            new_data_count = session.execute(
                f"SELECT COUNT(*)FROM {table_name_insert};"
            ).scalar()
            summary_data = new_data_count - actual_data_count
            # summary_data = abs(actual_data_count - total_count)
            status_type = "Failed"
            mssge_string = str(e)

            # if new_data_count == actual_data_count:
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "notifications",
                {
                    "type": "data_notifications",
                    "count": summary_data,
                    "total": total_count,
                    "status": status_type,
                    "file": csv_file,
                    "id": csv_id,
                    "mssg": mssge_string,
                },
            )


async def quicker_upload(loop, table_name, csv_file, ids):
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
            await upload_data_tables(cur, table_name, csv_file, ids)
    pool.close()
    await pool.wait_closed()


def delete_file_workspaces(filename):
    print("delete_files_workspaces")
    app_workspace_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "workspaces", "app_workspace"
    )
    path_file = os.path.join(app_workspace_path, filename)
    try:
        os.remove(path_file)
    except Exception as e:
        print(e)
    pass
