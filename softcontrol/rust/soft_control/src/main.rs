extern crate serialport;
extern crate argparse;

extern crate serde;
extern crate serde_json;

extern crate ws;

#[macro_use]
extern crate serde_derive;

use serialport::prelude::*;

use std::thread;
use std::time::Duration;
use std::sync::mpsc::channel;
//use std::sync::mpsc::Sender;
use std::sync::{Arc,Mutex};
use std::fs::File;
use std::path::Path;

use ws::{Sender};

use argparse::{ArgumentParser, Store};

mod breakout;
mod ws_server;

#[derive(Deserialize, Debug)]
struct Breakout {
    name: String
}

#[derive(Deserialize, Debug)]
struct ServerConfig {
    port: u16
}

#[derive(Deserialize, Debug)]
pub struct Config {
    breakout: Breakout,
    server: ServerConfig,
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

    
    // Server thread
    let server_sc = soft_controller.clone();
    let server = thread::Builder::new().name("server".to_owned()).spawn(move || {
        ws_server::start(server_sc, config);
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

    let _ = serial.join();
    let _ = server.join();
    let _ = serial_broadcast.join();
}
