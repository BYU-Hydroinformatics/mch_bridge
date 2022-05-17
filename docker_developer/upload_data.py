import pandas as pd
import os
import asyncio
import aiomysql
import numpy as np
from dotenv import load_dotenv

load_dotenv()


host_db = os.environ.get('HOST_DB')
port_db = os.environ.get('PORT_DB')
user_db = os.environ.get('USER_DB')
password_db = os.environ.get('PASSWORD_DB')
db_name = os.environ.get('DB_NAME')

csv_path = 'stations.csv'
upload_type = 'stations'




async def upload_data_tables(cur,table_name):
    df = pd.read_csv(csv_path,index_col=False, dtype='str')
    df = df.where(pd.notnull(df), None)
    print(df)
    columns = list(df.columns.values)
    columns_string = ', '.join(columns)
    print(len(columns))
    placeholders = ', '.join(['%s'] * len(columns))
    print(len(placeholders))
    records_tuple = df.to_records(index=False)
    records_list_tuples = list(records_tuple)
    records_list_tuples = [tuple(i) for i in records_list_tuples]
    sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % (table_name, columns_string, placeholders)
    await cur.executemany(sql, records_list_tuples)


async def test_example(loop,table_name):
    pool = await aiomysql.create_pool(host=host_db, port=3306,
                                      user=user_db, password=password_db,
                                      db=db_name, loop=loop)
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await upload_data_tables(cur,table_name)
    pool.close()
    await pool.wait_closed()


loop = asyncio.get_event_loop()
loop.run_until_complete(test_example(loop,upload_type))





