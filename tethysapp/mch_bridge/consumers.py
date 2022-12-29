import json
import logging
import sys
import threading

from channels.generic.websocket import AsyncWebsocketConsumer

# trunk-ignore(flake8/F401)
from .controllers import delete_file_workspaces, upload__data
from tethys_sdk.routing import consumer
logger = logging.getLogger("tethys.apps.mch_bridge")
logger.setLevel(logging.INFO)


@consumer(name='adding_data_notifications',url='mch-bridge/upload-data/notifications/')
class AddingDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("notifications", self.channel_name)
        print(f"Added {self.channel_name} channel to notifications")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)
        print(f"Removed {self.channel_name} channel from notifications")

    async def data_notifications(self, event):
        print(event)
        count = event["count"]
        status = event["status"]
        file = event["file"]
        id_ = event["id"]
        total_count = event["total"]
        mssge = event["mssg"]

        resp_obj = {
            "count": count,
            "status": status,
            "file": file,
            "id": id_,
            "total": total_count,
            "mssg": mssge,
        }
        await self.send(text_data=json.dumps(resp_obj))
        print(f"Got message {event} at {self.channel_name}")

    async def simple_notifications(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))
        print(f"Got message {event} at {self.channel_name}")

    async def receive(self, text_data):
        # logger.info(f"Received message {text_data} at {self.channel_name}")
        print("RECEIVING")
        text_data_json = json.loads(text_data)
        print(text_data_json)
        type_operation = text_data_json["type"]
        csv_file = text_data_json["csv_file"]
        print(csv_file)
        if "type" in text_data_json and text_data_json["type"] == "upload__data":
            ids = text_data_json["id"]
            upload_type = text_data_json["type_upload"]

            # if "type" in text_data_json:
            thread = threading.Thread(
                target=getattr(sys.modules[__name__], type_operation),
                args=(upload_type, csv_file, ids, self.channel_layer)
                #   args=(upload_type,csv_file, self.channel_layer)
            )
            thread.start()
        if (
            "type" in text_data_json
            and text_data_json["type"] == "delete_file_workspaces"
        ):
            thread = threading.Thread(
                target=getattr(sys.modules[__name__], type_operation), args=(csv_file,)
            )
            thread.start()
        if "type" not in text_data_json:
            logger.info("Can't redirect incoming message.")

        # text_data_json = json.loads(text_data)

        # if "type" in text_data_json:
        #     thread = threading.Thread(target=getattr(sys.modules[__name__], text_data_json['type']),
        #                               args=(text_data_json['data'], self.channel_layer)
        #                               )
        #     thread.start()
        # else:
        #     logger.info("Can't redirect incoming message.")
