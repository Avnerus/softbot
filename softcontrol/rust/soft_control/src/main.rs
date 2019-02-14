extern crate serialport;
extern crate argparse;
extern crate serde;
extern crate serde_json;
extern crate ws;
extern crate byteorder;
extern crate chrono;


#[macro_use]
extern crate serde_derive;

use serialport::prelude::*;

use std::thread;
use std::time::Duration;
use std::sync::mpsc::{Sender, Receiver, channel};
use std::sync::{Arc,Mutex};
use std::fs::File;
use std::path::Path;
use std::io::{self, Write};

use argparse::{ArgumentParser, Store};
use chrono::Local;

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
    let mut log = File::create("log.txt").unwrap();

    let (sensing_in, sensing_out) = channel();
    let (motor_in, motor_out): (Sender<Vec<u8>>, Receiver<Vec<u8>>) = channel();

    let mut port_name = "".to_string();
    let baud_rate: u32 = 9600;

    let serial_config = Arc::clone(&config);
    let mut settings: SerialPortSettings = Default::default();

    let port_name = &serial_config.serial.port;
    let baud_rate = serial_config.serial.baud_rate;

    settings.baud_rate = baud_rate.into();
    settings.timeout = Duration::from_millis(10);

    println!("Sending/Receiving data on {} at {} baud:", port_name,baud_rate);

    println!("Starting server");
    // Server thread
    let server = thread::Builder::new().name("server".to_owned()).spawn(move || {
        ws_server::start(
            Arc::clone(&config),
            sensing_out,
            motor_in
        );
    }).unwrap();



    match serialport::open_with_settings(port_name, &settings) {
        Ok(mut port) => {
            let mut port_read = port.try_clone().expect("Couldn't clone serial");
            let serial_read = thread::Builder::new().name(
                "serial_read".to_owned()).spawn(move || -> Result<usize,serialport::Error> {
                println!("Sensing thread");
                let mut serial_buf: Vec<u8> = vec![0; 1000];
                let mut buf: [u8;1] = [0];
                loop {
                    //match port_read.read(serial_buf.as_mut_slice()) {
                    match port_read.read_exact(&mut buf) {
                        Ok(t) => {
                            let c = buf[0] as char;
                            match c  {
                                '>' => {
                                    serial_buf.drain(..);
                                }
                                '<' => {
                                    if serial_buf[0] as char == 'D' {
                                        let date = Local::now();
                                        log.write_all(format!("{} ",date.format("%H:%M:%S")).as_bytes());
                                        log.write_all(&serial_buf);
                                        log.write_all(b"\n");
                                    }
                                    sensing_in.send(serial_buf.clone()).unwrap();
                                }
                                _ => {
                                    serial_buf.extend_from_slice(&buf);
                                }
                            }
                           // io::stdout().write_all(&serial_buf[..t]).unwrap();
                            //sensing_in.send(serial_buf.clone()).unwrap();
                            //sensing_in.send(serial_buf[..t].to_vec()).unwrap();
                        } 
                        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                        Err(e) => eprintln!("{:?}", e)
                    }
                } 
                Ok(1)
            }).unwrap();
            let serial_write = thread::Builder::new().name(
                "serial_write".to_owned()).spawn(move || -> Result<usize,serialport::Error> {
                println!("Motoric thread");
                while let Ok(msg) = motor_out.recv() {
                    println!("Message to serial!");
                    port.write(&msg);
                }
                Ok(1)
            }).unwrap();

            if let Err(err) = serial_read.join() {
                println!("Serial read thread panicked! {:?}", err);
            }

            if let Err(err) = serial_write.join() {
                println!("Serial write thread panicked! {:?}", err);
            }
        },
        Err(e) => {
            eprintln!(
                "Failed to open \"{}\". Error: {}",
                port_name,
                e
            );
            return;
        }
    }


    
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

    let _ = server.join();
    //let _ = serial_broadcast.join();
}
