use std::sync::{Arc,Mutex};
use ws::{listen, CloseCode, Message, Sender, Handler, Handshake};
use std::thread::{JoinHandle};
use std::thread;
use std::sync::mpsc;
use std::str;
use std::rc::Rc;
use std::io::{Error, ErrorKind};
use ws;

use soft_error::SoftError;
use Config;
use breakout;

struct ServerState {
    soft_controller: Arc<Mutex<Option<Sender>>>,
    soft_avatar: Arc<Mutex<Option<Sender>>>,
    breakout: Option<JoinHandle<()>>,
    breakout_tx: Option<mpsc::Sender<Vec<u8>>>
}

// WebSocket connection handler for the server connection
struct Server {
   ws: Sender,
  //  serial: ThreadOut<String>,
   config: Arc<Config>,
   state: Rc<ServerState>
}

fn handle_message(mut server: &Server, msg: Message) -> Result<(), SoftError> {
    println!("Server got message '{}'. ", msg);
    let data = msg.into_data();

    // First char is the command
    let command = data[0] as char;
    println!("Command code: {}.", command);

    match command {
        'S' => {
            // Start command
            let app = str::from_utf8(&data[1..]).unwrap();
            println!("Start app {:?}", app);
        }

        'R' => {
            // Register command
            let role = data[1];
            println!("Register command role {}", role);
            if let Some(mut soft_target) = match role {
                0 => Some(server.state.soft_controller.lock().unwrap()),
                1 => Some(server.state.soft_avatar.lock().unwrap()),
                _ => None
            } {
                let target_exists = match soft_target.as_ref() {
                        Some(s) => true,
                        None => false
                };
                if !target_exists {
                    *soft_target = Some(server.ws.clone());
                    println!("Registeration sucessfull")
                } else {
                    return Err(SoftError::new("Cannot register - user already connected!"));
                }
            } else {
                return Err(SoftError::new("Cannot register. No such role!"));
            }
        }
        _ => return Err(SoftError::new("Unknown command"))
    }

    /*
    let msg_text = msg.into_text().unwrap();

    if msg_text == "SBREAKOUT" {
        println!("Start breakout!");
        let breakout_config = Arc::clone(&self.config);
        let (breakout_tx, breakout_rx) = mpsc::channel();
        self.breakout_tx = Some(breakout_tx.clone());
        self.breakout = Some(
            thread::Builder::new().name("breakout".to_owned()).spawn(move || {
                breakout::start(
                    breakout_config,
                    breakout_rx
                );
        }).unwrap());

        self.ws.send("PBREAKOUT")?;
    }
    if msg_text == "AVNER" {
        println!("Send to breakout!");
        match self.breakout_tx.as_ref() {
            Some(c) => c.send(vec![1,1,1]).unwrap(),
            None => {},
        }
    }*/

    Ok(())
}


impl Handler for Server {
    fn on_open(&mut self, _: Handshake) -> ws::Result<()> {
        println!("Client connected!");
        let token = self.ws.token();
        println!("Client token: {:?}", token);
        Ok(())
    }
    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        match handle_message(self, msg) {
            Err(err) => {
                println!("Error! {:?}", err);
                let mut prefix = "E".to_string();
                prefix.push_str(&err.message);
                self.ws.send(prefix);
            },
            Ok(()) => {}
        }
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        println!("Client disconnected! ({:?}, {})",code,reason);
        /*
        let mut sc = self.state.soft_controller.lock().unwrap();
        *sc = None;*/
    }
}

pub fn start(
    server_sc: Arc< Mutex < Option< Sender > > >, 
    server_sa: Arc< Mutex < Option< Sender > > >, 
    config: Arc<Config>
) {
    println!("Spawning server on port {}", config.server.port);

    let state = Rc::new(ServerState {
        soft_controller: server_sc,
        soft_avatar: server_sa,
        breakout: None,
        breakout_tx: None
    });

    listen(("127.0.0.1",config.server.port), move |out| {
        println!("Connection");
        Server {
            ws: out,
            config: Arc::clone(&config),
            state: Rc::clone(&state)
        }
    }).unwrap();
}
