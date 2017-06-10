import serial
import serial.tools.list_ports
import time
import multiprocessing

## Change this to match your local settings
SERIAL_PORT_REGEX = 'usbmodem' #'ttyACM' #'usbmodem'
SERIAL_BAUDRATE = 9600

class SerialProcess(multiprocessing.Process):
 
    def __init__(self, input_queue, output_queue, event):
        multiprocessing.Process.__init__(self)
        self.input_queue = input_queue
        self.output_queue = output_queue
        self.event = event

        ports = list(serial.tools.list_ports.grep(SERIAL_PORT_REGEX))
        if (len(ports) > 0):
            self.sp = serial.Serial(ports[0].device, SERIAL_BAUDRATE, timeout=1)
        else:
            raise Exception('Could not find a serial port matching /' + SERIAL_PORT_REGEX + '/')


 
    def close(self):
        self.sp.close()
 
    def writeSerial(self, data):
        self.sp.write(data)
        # time.sleep(1)
        
    def readSerial(self):
        return self.sp.readline().replace("\n", "")
 
    def run(self):
 
        self.sp.flushInput()
 
        while True:

            # look for incoming tornado request
            self.event.wait()

            while not self.input_queue.empty():
                data = self.input_queue.get()

                # send it to the serial device
                print ("writing to serial: " , data)
                self.writeSerial(data)
     
                # look for incoming serial data
            #    if (self.sp.inWaiting() > 0):
            #        data = self.readSerial()
            #        print ("reading from serial: " + data)
            #        # send it back to tornado
            #        self.output_queue.put(data)
