extern crate ws;
extern crate serialport;
extern crate argparse;

use ws::{listen, CloseCode, Message, Sender, Handler, Handshake, Result};
use serialport::prelude::*;

use std::thread;
use std::time::Duration;
use std::sync::mpsc::channel;
//use std::sync::mpsc::Sender;
use std::sync::{Arc,Mutex};

use argparse::{ArgumentParser, Store};

fn main() {
    println!("Hello, Rusty WS server!");

    let (broadcast_in, broadcast_out) = channel();
   // let (serial_in, serial_out) = channel();

    let mut port_name = "".to_string();
    let baud_rate: u32 = 57600;

    let sc:Option<Sender> = None;
    let soft_controller = Arc::new(Mutex::new(sc));

    {
        let mut ap = ArgumentParser::new();
        ap.set_description("Read from the given serial port");
        ap.refer(&mut port_name)
        .add_argument("port", Store, "Port name")
        .required();

        ap.parse_args_or_exit();
    }

    let serial = thread::Builder::new().name("serial".to_owned()).spawn(move || {
        let mut settings: SerialPortSettings = Default::default();
        settings.baud_rate = baud_rate.into();

        if let Ok(mut port) = serialport::open_with_settings(&port_name, &settings) {
            let mut serial_buf: Vec<u8> = vec![0; 1];
            println!("Receiving data on {} at {} baud:", &port_name, &baud_rate);
            loop {
                if let Ok(t) = port.read(serial_buf.as_mut_slice()) {
                    //println!("{:?} ({})",serial_buf,t);
                    broadcast_in.send(serial_buf.clone()).unwrap();
                }
                thread::sleep(Duration::from_millis(10));
            }
        } else {
            println!("Error: Port '{}' not available", &port_name);
        }

    }).unwrap();

    // WebSocket connection handler for the server connection
    struct Server {
        ws: Sender,
      //  serial: ThreadOut<String>,
        soft_controller: Arc<Mutex<Option<Sender>>>,
    }
    impl Handler for Server {
        fn on_open(&mut self, _: Handshake) -> Result<()> {
            println!("Client connected!");
            let mut sc = self.soft_controller.lock().unwrap();
            *sc = Some(self.ws.clone());
            Ok(())
        }
        fn on_message(&mut self, msg: Message) -> Result<()> {
            println!("Server got message '{}'. ", msg);
            Ok(())
        }

        fn on_close(&mut self, code: CloseCode, reason: &str) {
            println!("Client disconnected! ({:?}, {})",code,reason);
            let mut sc = self.soft_controller.lock().unwrap();
            *sc = None;
        }
    }
    
    // Server thread
    let server_sc = soft_controller.clone();
    let server = thread::Builder::new().name("server".to_owned()).spawn(move || {
        println!("Spwaning server");
        listen("127.0.0.1:3012", |out| {
            println!("Connection");
            Server {
                ws: out,
                soft_controller: server_sc.clone()
            }
        }).unwrap();
    }).unwrap();


    // From serial to broadcast
    let sc_check = soft_controller.clone();
    let serial_broadcast = thread::spawn(move || {
        while let Ok(msg) = broadcast_out.recv() {
            let soft_controller = sc_check.lock().unwrap();
            match soft_controller.as_ref() {
                Some(socket) => {
                    let res = socket.send(msg);
                    match res {
                        Ok(val) => {;} //println!("Sent! {:?}", val),
                        Err(err) => println!("Error sending! {}", err),
                    }
                },
                None => println!("No soft controller!"),
            }
        }
    });

    let _ = serial.join();
    let _ = server.join();
    let _ = serial_broadcast.join();
}
