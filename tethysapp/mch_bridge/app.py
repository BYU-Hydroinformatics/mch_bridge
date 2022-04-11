from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import CustomSetting

class MchBridge(TethysAppBase):
    """
    Tethys app class for Mch Bridge.
    """

    name = 'Mch Bridge'
    index = 'mch_bridge:home'
    icon = 'mch_bridge/images/logo.svg'
    package = 'mch_bridge'
    root_url = 'mch-bridge'
    color = '#71697a'
    description = ''
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='mch-bridge',
                controller='mch_bridge.controllers.home'
            ),
            UrlMap(
                name='upload_data',
                url='upload-data/',
                controller='mch_bridge.controllers.upload__data'
            ),
        )

        return url_maps

    def custom_settings(self):
        """
        Example custom_settings method.
        """
        custom_settings = (
            CustomSetting(
                name='Database host',
                type=CustomSetting.TYPE_STRING,
                description='Host of the MCH Database',
                required=True
            ),
            CustomSetting(
                name='Database Port',
                type=CustomSetting.TYPE_STRING,
                description='Port of the MCH Database',
                required=False
            ),
            CustomSetting(
                name='Database User',
                type=CustomSetting.TYPE_STRING,
                description='User of the MCH Database',
                required=True
            ),
            CustomSetting(
                name='Database Password',
                type=CustomSetting.TYPE_STRING,
                description='Password of the MCH Database',
                required=True
            ),
            CustomSetting(
                name='Database Name',
                type=CustomSetting.TYPE_STRING,
                description='Name of the MCH Database',
                required=True
            )
        )

        return custom_settings