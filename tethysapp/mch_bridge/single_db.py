import pandas as pd

# trunk-ignore(flake8/F401)
import pymysql
import sqlalchemy as db
from sqlalchemy.orm import sessionmaker

from .app import MchBridge as app


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
    session=None
    imcomplete_settings = False
    try:
        host_db = app.get_custom_setting("Database host")
    except Exception as e:
        host_db = None
        imcomplete_settings = True
        print("db host not provided in app settings", e)

    try:
        port_db = app.get_custom_setting("Database Port")

    except Exception as e:
        print("db port not provided in app settings", e)
        imcomplete_settings = True
        port_db = None

    try:
        user_db = app.get_custom_setting("Database User")
    except Exception as e:
        print("db user name not provided in app settings", e)
        imcomplete_settings = True
        user_db = None

    try:
        password_db = app.get_custom_setting("Database Password")
    except Exception as e:
        print("db user password not provided in app settings", e)
        imcomplete_settings = True
        password_db = None

    try:
        db_name = app.get_custom_setting("Database Name")
    except Exception as e:
        print("db name not provided in app settings", e)
        imcomplete_settings = True
        db_name = None

    def __init__(self):

        if Database.engine is None and Database.imcomplete_settings is False:
            try:
                Database.engine = db.create_engine(
                    f"mysql+pymysql://{self.user_db}:{self.password_db}@{self.host_db}:{self.port_db}/{self.db_name}?charset=utf8",
                    pool_recycle=60, pool_pre_ping=True
                )
                database_metadata = db.MetaData(bind=Database.engine)
                database_metadata.reflect()
                Session = sessionmaker(bind=Database.engine)
                Database.session = Session()
                # Database.connection = mysql.connector.connect(host="127.0.0.1", user="root", password="", database="db_test")
            except Exception as error:
                print("Error: Connection not established {}".format(error))
            else:
                print("Connection established")
        else:
            print("db already connected")
        self.engine = Database.engine
        self.session = Database.session


    def manage_session(f):
        def inner(*args, **kwargs):

            # MANUAL PRE PING
            try:
                Database.session.execute("SELECT 1;")
                Database.session.commit()
            except Exception as e:
                print("rolling back")
                Database.session.rollback()
            finally:
                print("closing db")
                Database.session.close()

            # SESSION COMMIT, ROLLBACK, CLOSE
            try:
                res = f(*args, **kwargs)
                Database.session.commit()
                return res
            except Exception as e:
                Database.session.rollback()
                raise e
                # OR return traceback.format_exc()
            finally:
                Database.session.close()
        return inner
    @manage_session
    def df_from_execute_statement(self, query):

        actual_data_rows = self.session.execute(query)
        result = [dict(row) for row in actual_data_rows]
        df = pd.DataFrame(result)
        return df
