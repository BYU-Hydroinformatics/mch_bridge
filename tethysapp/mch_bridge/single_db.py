from .app import MchBridge as app
import sqlalchemy as db
import pymysql
import pandas as pd
from sqlalchemy.orm import sessionmaker

# host_db = app.get_custom_setting("Database host")
# port_db = app.get_custom_setting("Database Port")
# user_db = app.get_custom_setting("Database User")
# password_db = app.get_custom_setting("Database Password")
# db_name = app.get_custom_setting("Database Name")
# engine = db.create_engine(f'mysql+pymysql://{user_db}:{password_db}@{host_db}:{port_db}/{db_name}?charset=utf8')
# database_metadata = db.MetaData(bind=engine)
# database_metadata.reflect()
# Session = sessionmaker(bind=engine)
# session = Session()
# actual_data_rows = session.execute('SELECT * FROM stations;')
class Database(object):

    engine = None
    session = None
    imcomplete_settings = False
    try:
        host_db = app.get_custom_setting("Database host")
    except Exception as e:
        host_db = None
        imcomplete_settings = True
        print("db host not provided in app settings")

    try:
        port_db = app.get_custom_setting("Database Port")

    except Exception as e:
        print("db port not provided in app settings")
        imcomplete_settings = True
        port_db = None
    
    try:
        user_db = app.get_custom_setting("Database User")
    except Exception as e:
        print("db user name not provided in app settings")
        imcomplete_settings = True
        user_db = None
    
    try:
        password_db = app.get_custom_setting("Database Password")
    except Exception as e:
        print("db user password not provided in app settings")
        imcomplete_settings = True
        password_db = None
    
    try:
        db_name = app.get_custom_setting("Database Name")
    except Exception as e:
        print("db name not provided in app settings")
        imcomplete_settings = True
        db_name = None

    def __init__(self):
    

        if Database.engine is None and Database.imcomplete_settings is False:
            try:
                Database.engine = db.create_engine(f'mysql+pymysql://{self.user_db}:{self.password_db}@{self.host_db}:{self.port_db}/{self.db_name}?charset=utf8')
                # Database.connection = mysql.connector.connect(host="127.0.0.1", user="root", password="", database="db_test")
                database_metadata = db.MetaData(bind=Database.engine)
                database_metadata.reflect()
                Session = sessionmaker(bind=Database.engine)
                Database.session = Session()                
            except Exception as error:
                print("Error: Connection not established {}".format(error))
            else:
                print("Connection established")

        self.engine = Database.engine
        self.session = Database.session

    def df_from_execute_statement(self,query):
        actual_data_rows = self.session.execute(query)
        result = [dict(row) for row in actual_data_rows]
        df = pd.DataFrame(result)
        return df