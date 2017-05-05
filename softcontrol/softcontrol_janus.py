import janus
import logging

logging.basicConfig(level=logging.DEBUG)

class SoftBotPlugin(janus.Plugin):

    name = 'janus.plugin.softbot'

softbot_plugin = SoftBotPlugin()
session = janus.Session('ws://127.0.0.1:8188', secret='janusrocks')
session.register_plugin(softbot_plugin)
session_sb = janus.KeepAlive(session)
session_sb.daemon = True
session_sb.start()
session_sb.run()
