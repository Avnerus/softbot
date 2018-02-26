use std::sync::{Arc,Mutex};
use ws::{listen, CloseCode, Message, Sender, Handler, Handshake};
use ws::util::Token;
use ws;

use std::thread::{JoinHandle};
use std::thread;
use std::sync::mpsc;
use std::sync::MutexGuard;
use std::str;
use std::rc::Rc;
use std::io::{Error, ErrorKind};
use std::collections::HashMap;

use soft_error::SoftError;
use Config;
use breakout;

struct ServerState {
    soft_controller: Option<Sender>,
    soft_avatar: Option<Sender>,
    tokens: HashMap<Token, u8>,
    breakout: Option<JoinHandle<()>>,
    breakout_tx: Option<mpsc::Sender<Vec<u8>>>
}

// WebSocket connection handler for the server connection
struct Server {
   ws: Sender,
  //  serial: ThreadOut<String>,
   config: Arc<Config>,
   state: Arc<Mutex<ServerState>>
}

struct Foo {
    a: i32,
    b: i32
}

fn handle_message(
    server: &mut Server,
    msg: Message
) -> Result<(), SoftError> {
    println!("Server got message '{}'. ", msg);
    let data = msg.into_data();

    let mut state = &mut *server.state.lock().unwrap();
    let command = data[0] as char;
    println!("Command code: {}.", command);

    // Only command possible without a role is R-Register
    if command == 'R' {
        let role = data[1];
        println!("Register command role {}", role);
        if let Some(soft_target) = match role {
            0 => Some(&mut state.soft_controller),
            1 => Some(&mut state.soft_avatar),
            _ => None
        } {
            match soft_target {
                &mut Some(ref s) => {
                    return Err(SoftError::new("Cannot register - user already connected!"));
                },
                &mut None => {
                    *soft_target = Some(server.ws.clone());
                     state.tokens.insert(server.ws.token(), role);
                     println!("Registration successful")
                }
            }
            let target_exists = match soft_target.as_ref() {
                    Some(s) => true,
                    None => false
            };
        } else {
            return Err(SoftError::new("Cannot register. No such role!"));
        }
    }
    else {
        if let Some(role) = state.tokens.get(&server.ws.token()) {
            match command {
                'S' => {
                    // Start command
                    let app = str::from_utf8(&data[1..]).unwrap();
                    println!("Start app {:?}", app);
                    if app == "BREAKOUT" {
                        println!("Start breakout!");
                        let breakout_config = Arc::clone(&server.config);
                        let (breakout_tx, breakout_rx) = mpsc::channel();
                        state.breakout_tx = Some(breakout_tx.clone());
                        state.breakout = Some(
                            thread::Builder::new().name("breakout".to_owned()).spawn(move || {
                                breakout::start(
                                    breakout_config,
                                    breakout_rx
                                );
                        }).unwrap());

                        server.ws.send("PBREAKOUT").unwrap();
                    }
                     /*
                    if app == "AVNER" {
                        println!("Send to breakout!");
                        match self.breakout_tx.as_ref() {
                            Some(c) => c.send(vec![1,1,1]).unwrap(),
                            None => {},
                        }
                    }*/
                }
                _ => return Err(SoftError::new("Unknown command"))
            }
        } else {
            return Err(SoftError::new("Not registered"))
        }
    }

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
        match handle_message(
            self,
            msg
        ) {
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
        let state = &mut *self.state.lock().unwrap();
        if let Some(role) = state.tokens.get(&self.ws.token()) {
            if let Some(soft_target) = match role {
                &0 => Some(&mut state.soft_controller),
                &1 => Some(&mut state.soft_avatar),
                _ => None
            } {
                println!("Disconnected from role {:}", role);
                *soft_target = None;                
            }
        }
        state.tokens.remove(&self.ws.token());
        /*
        let mut sc = self.state.soft_controller.lock().unwrap();
        *sc = None;*/
    }
}

pub fn start(
    config: Arc<Config>
) {
    println!("Spawning server on port {}", config.server.port);

    let state = Arc::new(Mutex::new(ServerState {
        soft_controller: None,
        soft_avatar: None,
        tokens: HashMap::new(),
        breakout: None,
        breakout_tx: None
    }));

    listen(("127.0.0.1",config.server.port), move |out| {
        println!("Connection");
        Server {
            ws: out,
            config: Arc::clone(&config),
            state: Arc::clone(&state)
        }
    }).unwrap();
}
