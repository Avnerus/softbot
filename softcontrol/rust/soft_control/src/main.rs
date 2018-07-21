extern crate serialport;
extern crate argparse;
extern crate serde;
extern crate serde_json;
extern crate ws;
extern crate byteorder;


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
use std::io::{self, Write};

use ws::{Sender};

use argparse::{ArgumentParser, Store};

mod soft_error;
mod breakout_state;
mod ws_server;
mod game;

#[derive(Deserialize, Debug)]
struct Breakout {
    name: String
}

#[derive(Deserialize, Debug)]
struct ServerConfig {
    port: u16
}

#[derive(Deserialize, Debug)]
struct SerialConfig {
    port: String,
    baud_rate: u32
}

#[derive(Deserialize, Debug)]
pub struct Config {
    breakout: Breakout,
    server: ServerConfig,
    serial: SerialConfig,
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

    let config = Arc::new(read_config().unwrap());

    let (sensing_in, sensing_out) = channel();
   // let (serial_in, serial_out) = channel();

    let mut port_name = "".to_string();
    let baud_rate: u32 = 9600;

    let serial_config = Arc::clone(&config);

    let serial = thread::Builder::new().name("serial".to_owned()).spawn(move || -> Result<usize,serialport::Error> {
        println!("Sensing thread");
        let mut settings: SerialPortSettings = Default::default();

        let port_name = &serial_config.serial.port;
        let baud_rate = serial_config.serial.baud_rate;

        settings.baud_rate = baud_rate.into();
        settings.timeout = Duration::from_millis(10);

        match serialport::open_with_settings(port_name, &settings) {
            Ok(mut port) => {
                let mut serial_buf: Vec<u8> = vec![0; 1000];
                println!("Receiving data on {} at {} baud:", port_name,baud_rate);
                loop {
                    match port.read(serial_buf.as_mut_slice()) {
                        Ok(t) => {
                            io::stdout().write_all(&serial_buf[..t]).unwrap();
                            sensing_in.send(serial_buf.clone()).unwrap();
                        } 
                        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                        Err(e) => eprintln!("{:?}", e)
                    }
                }
            },
            Err(e) => {
                eprintln!(
                    "Failed to open \"{}\". Error: {}",
                    port_name,
                    e
                );
                return Err(e);
            }
        }
    }).unwrap();

    
    // Server thread
    let server = thread::Builder::new().name("server".to_owned()).spawn(move || {
        ws_server::start(
            Arc::clone(&config),
            sensing_out
        );
    }).unwrap();


    // From serial to broadcast
    /*
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
    }); */

    if let Err(err) = serial.join() {
        println!("Serial thread panicked! {:?}", err);
    }

    println!("Serial thread joined");
    let _ = server.join();
    //let _ = serial_broadcast.join();
}
