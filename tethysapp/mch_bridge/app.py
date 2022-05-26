from tethys_sdk.app_settings import CustomSetting
from tethys_sdk.base import TethysAppBase, url_map_maker


class MchBridge(TethysAppBase):
    """
    Tethys app class for Mch Bridge.
    """

    name = "Mch Bridge"
    index = "mch_bridge:home"
    icon = "mch_bridge/images/logo.svg"
    package = "mch_bridge"
    root_url = "mch-bridge"
    color = "#71697a"
    description = ""
    tags = ""
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name="home", url="mch-bridge", controller="mch_bridge.controllers.home"
            ),
            UrlMap(
                name="stations", url="stations/", controller="mch_bridge.controllers.stations"
            ),
            # UrlMap(
            #     name="stations-upload", url="stations/upload-data/", controller="mch_bridge.controllers.upload__data"
            # ),
            UrlMap(
                name="groupStations", url="groupStations/", controller="mch_bridge.controllers.groupStations"
            ),
            # UrlMap(
            #     name="groupStations-upload", url="groupStations/upload-data/", controller="mch_bridge.controllers.upload__data"
            # ),
            UrlMap(
                name="variableStationTypes", url="variableStationTypes/", controller="mch_bridge.controllers.variableStationTypes"
            ),
            UrlMap(
                name="variableStationTypes-upload", url="variableStationTypes/upload-data/", controller="mch_bridge.controllers.upload__data"
            ),
            UrlMap(
                name="timeSeries", url="timeSeries/", controller="mch_bridge.controllers.timeSeries"
            ),
            UrlMap(
                name="timeSeries-upload", url="timeSeries/upload-data/", controller="mch_bridge.controllers.upload__data"
            ),
            UrlMap(
                name="instructions", url="isntructions/", controller="mch_bridge.controllers.instructions"
            ),
            UrlMap(
                name="upload_data",
                url="upload-data/",
                controller="mch_bridge.controllers.upload__data",
            ),
            UrlMap(
                name="stations-upload_files",
                url="stations/upload-files/",
                controller="mch_bridge.controllers.upload__files",
            ),
            UrlMap(
                name="variableStationTypes-upload_files",
                url="variableStationTypes/upload-files/",
                controller="mch_bridge.controllers.upload__files",
            ),
            UrlMap(
                name="timeSeries-upload_files",
                url="timeSeries/upload-files/",
                controller="mch_bridge.controllers.upload__files",
            ),
            UrlMap(
                name="groupStations-upload_files",
                url="groupStations/upload-files/",
                controller="mch_bridge.controllers.upload__files",
            ),
            UrlMap(
                name='adding_data_notifications',
                url='upload-data/notifications/',
                controller='mch_bridge.consumers.AddingDataConsumer',
                protocol='websocket'
            ),

        )

        return url_maps

    def custom_settings(self):
        """
        Example custom_settings method.
        """
        custom_settings = (
            CustomSetting(
                name="Database host",
                type=CustomSetting.TYPE_STRING,
                description="Host of the MCH Database",
                required=True,
            ),
            CustomSetting(
                name="Database Port",
                type=CustomSetting.TYPE_STRING,
                description="Port of the MCH Database",
                required=False,
            ),
            CustomSetting(
                name="Database User",
                type=CustomSetting.TYPE_STRING,
                description="User of the MCH Database",
                required=True,
            ),
            CustomSetting(
                name="Database Password",
                type=CustomSetting.TYPE_STRING,
                description="Password of the MCH Database",
                required=True,
            ),
            CustomSetting(
                name="Database Name",
                type=CustomSetting.TYPE_STRING,
                description="Name of the MCH Database",
                required=True,
            ),
        )

        return custom_settings
