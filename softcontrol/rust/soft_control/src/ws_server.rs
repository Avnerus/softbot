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
use std::sync::mpsc::channel;

use soft_error::SoftError;
use Config;
use game;

struct ServerState {
    soft_controller: Option<Sender>,
    soft_avatar: Option<Sender>,
    broadcaster: Option<Sender>,
    tokens: HashMap<Token, u8>,
    game: Option<JoinHandle<()>>,
    game_tx: Option<mpsc::Sender<Vec<u8>>>,
    comm_tx: mpsc::Sender<Vec<u8>>
}

// WebSocket connection handler for the server connection
struct Server {
   ws: Sender,
  //  serial: ThreadOut<String>,
   config: Arc<Config>,
   state: Arc<Mutex<ServerState>>,
   motor_tx: mpsc::Sender<Vec<u8>>
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
                        // Check that both players are here
                        if let (Some(ref sc), Some(ref sa)) = (&mut state.soft_controller, &mut state.soft_avatar) {
                                let breakout_config = Arc::clone(&server.config);
                                let (game_tx, game_rx) = mpsc::channel();
                                state.game_tx = Some(game_tx.clone());
                                let game_comm = state.comm_tx.clone();
                                state.game = Some(
                                    thread::Builder::new().name("game".to_owned()).spawn(move || {
                                        game::start(
                                            breakout_config,
                                            game_rx,
                                            game_comm
                                        )
                                }).unwrap());

                                sc.send("PBREAKOUT").unwrap();
                                sa.send("PBREAKOUT").unwrap();
                        }
                        else {
                            println!("Can't play with just one player!");
                            return Err(SoftError::new("Cannot play with just one player"))
                        }
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
                'C' => {
                    println!("Comm message");
                    // Just send it to the avatar
                    if let Some(sa) = & state.soft_avatar {
                        sa.send(data);
                    } else {
                        return Err(SoftError::new("No avatar connected!"))
                    }

                }
                '>' => {
                    // Send to serial
                    server.motor_tx.send(data);

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
    config: Arc<Config>,
    sensing_rx: mpsc::Receiver<Vec<u8>>,
    motor_tx: mpsc::Sender<Vec<u8>>

) {
    println!("Spawning server on port {}", config.server.port);

    let (comm_out, comm_in) = channel();

    let state = Arc::new(Mutex::new(ServerState {
        soft_controller: None,
        soft_avatar: None,
        broadcaster: None,
        tokens: HashMap::new(),
        game: None,
        game_tx: None,
        comm_tx: comm_out.clone()
    }));

    let comm_state = state.clone();

    /*
    let comm_thread = thread::spawn(move || {
        while let Ok(mut msg) = comm_in.recv() {
            let role = msg[0];
            println!("Comm message! to {}",role);
            let mut state = &mut comm_state.lock().unwrap();
            let handle = match role {
                0 => & state.soft_controller,
                1 => & state.soft_avatar,
                2 => & state.broadcaster,
                _ => & None
            };
            if let Some(soft_target) = handle {
               println!("Sending!");
               msg.remove(0);
               soft_target.send(msg).unwrap();
            } else {
               println!("ERROR, Invalid comm target");
            }
        }
    }); */


    let sensing_state = state.clone();

    let sensing_thread = thread::spawn(move || {
        while let Ok(mut msg) = sensing_rx.recv() {
            let command = msg[0] as char;
            match(command) {
                'S' => {
                    let state = & sensing_state.lock().unwrap();
                    match msg[1] as char {
                        'A' => {
                            println!("Arm sensing message!");
                            if let Some(sa) = & state.soft_avatar {
                               println!("Sending to avatar!");
                               sa.send(msg).unwrap();
                            }
                        }
                        'P' => {
                            println!("Pressure sensing message!");
                            if let Some(sc) = & state.soft_controller {
                               println!("Sending to controller!");
                               sc.send(msg).unwrap();
                            }
                        }
                        _ => {
                            println!("Unknown sensing message! {}", msg[1]);
                        }
                    }
                }
                'D' => {
                    let state = & sensing_state.lock().unwrap();
                    println!("Debug message!");
                    if let Some(sc) = & state.soft_controller {
                       sc.send(msg).unwrap();
                    }
                }
                _ => {
                    println!("Unknown sensing command! {}",command);
                }
            }
        }
    }); 

    listen(("0.0.0.0",config.server.port), move |out| {
        println!("Connection");
        Server {
            ws: out,
            config: Arc::clone(&config),
            state: Arc::clone(&state),
            motor_tx: motor_tx.clone()
        }
    }).unwrap();
}
