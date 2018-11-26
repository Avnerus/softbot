#! /usr/bin/python

import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import serialworker
import struct
import multiprocessing

#Tornado Folder Paths
settings = dict(
	template_path = os.path.join(os.path.dirname(__file__), "templates"),
	static_path = os.path.join(os.path.dirname(__file__), "static")
	)

#Tonado server port
PORT = 9540

input_queue = multiprocessing.Queue()
output_queue = multiprocessing.Queue()
event = multiprocessing.Event()

class MainHandler(tornado.web.RequestHandler):
  def get(self):
     print ("[HTTP](MainHandler) User Connected.")
     self.write('OK');

  def check_origin(self, origin):
     return True


  def set_default_headers(self):
       print ("setting headers!!!")
       self.set_header("Access-Control-Allow-Origin", "*")
       self.set_header("Access-Control-Allow-Headers", "x-requested-with")
       self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def options(self):
      # no body
      self.set_status(204)
      self.finish()


	
class WSHandler(tornado.websocket.WebSocketHandler):

  def set_default_headers(self):
       print ("setting WS headers!!!")
       self.set_header("Access-Control-Allow-Origin", "*")
       self.set_header("Access-Control-Allow-Headers", "x-requested-with")
       self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def check_origin(self, origin):
    return True

  def open(self):
    print ('[WS] Connection was opened.')
 
  def on_message(self, message):
    print ('[WS] Incoming message:', type(message),message)
    #num = int.from_bytes(message[0:3], byteorder='little')
    #print (num)
    #self.ser.write(str(num).encode('ascii'))
    #byte = struct.pack('>B', num)
    input_queue.put(message)
    event.set()

  def on_close(self):
    print ('[WS] Connection was closed.')

application = tornado.web.Application([
  (r'/', MainHandler),
  (r'/ws', WSHandler),
  ], **settings)


if __name__ == "__main__":
    try:
        ## start the serial worker in background (as a deamon)
        sp = serialworker.SerialProcess(input_queue, output_queue,event)
        sp.daemon = True
        sp.start()

        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(PORT)
        main_loop = tornado.ioloop.IOLoop.instance()

        print ("Tornado Server started")
        main_loop.start()

    except Exception as inst:
        print ("Exception triggered - Tornado Server stopped.",inst)

#End of Program

