extern crate ws;
extern crate serialport;
extern crate argparse;

extern crate serde;
extern crate serde_json;

#[macro_use]
extern crate serde_derive;

use ws::{listen, CloseCode, Message, Sender, Handler, Handshake};
use serialport::prelude::*;

use std::thread;
use std::time::Duration;
use std::sync::mpsc::channel;
//use std::sync::mpsc::Sender;
use std::sync::{Arc,Mutex};
use std::fs::File;
use std::path::Path;

use argparse::{ArgumentParser, Store};

mod breakout;

#[derive(Deserialize, Debug)]
struct Breakout {
    name: String
}

#[derive(Deserialize, Debug)]
struct Config {
    breakout: Breakout,
    version: String
}

fn read_config() -> Result<Config, Box<std::error::Error>> {
    let path = Path::new("./config.json");
    let file = File::open(path)?;
    let data = serde_json::from_reader(file)?;

    Ok(data)
}

fn main() {
    println!("Hello, Rusty WS server!");

    let config = Box::new(read_config().unwrap());
    println!("{:#?}", config);

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


    let serial = thread::Builder::new().name("serial".to_owned()).spawn(move || -> Result<usize,serialport::Error> {
        let mut settings: SerialPortSettings = Default::default();
        settings.baud_rate = baud_rate.into();

        let mut port = serialport::open_with_settings(&port_name, &settings)?;
        let mut serial_buf: Vec<u8> = vec![0; 1];
        println!("Receiving data on {} at {} baud:", &port_name, &baud_rate);
        
        loop {
            let t = port.read(serial_buf.as_mut_slice())?;
                //println!("{:?} ({})",serial_buf,t);
            if t > 0 {
                broadcast_in.send(serial_buf.clone()).unwrap();
            }
            thread::sleep(Duration::from_millis(10));
        }
    }).unwrap();

    // WebSocket connection handler for the server connection
    struct Server {
        ws: Sender,
      //  serial: ThreadOut<String>,
        soft_controller: Arc<Mutex<Option<Sender>>>,
    }
    impl Handler for Server {
        fn on_open(&mut self, _: Handshake) -> ws::Result<()> {
            println!("Client connected!");
            let mut sc = self.soft_controller.lock().unwrap();
            *sc = Some(self.ws.clone());
            Ok(())
        }
        fn on_message(&mut self, msg: Message) -> ws::Result<()> {
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
        listen("0.0.0.0:3012", |out| {
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
                        Ok(val) => val, //println!("Sent! {:?}", val),
                        Err(err) => println!("Error sending! {}", err),
                    }
                },
                None => println!("No soft controller!"),
            }
        }
    });

    // Breakout game


    breakout::start();

    let _ = serial.join();
    let _ = server.join();
    let _ = serial_broadcast.join();
}
