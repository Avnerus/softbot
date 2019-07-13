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
use std::time::{SystemTime, UNIX_EPOCH, Duration};

use soft_error::SoftError;
use Config;
use game;

const CONTROL_ROLE : usize = 0;
const AVATAR_ROLE : usize = 1;
const ADMIN_ROLE : usize = 2;

const  WAITING:u8 =  0;
const  READY:u8 = 1;
const  CHOSE_1:u8 = 2;
const  CHOSE_2:u8 = 3;
const  EXPLAIN_1:u8 = 4;
const  EXPLAIN_2:u8 = 5;
const  DONE_1:u8 = 6;
const  DONE_2:u8 = 7;

const LAST_EXPLAINED:usize = 2;

const CONTROLLER_TIMEOUT:Duration = Duration::from_secs(600);
const TYPING_TIMEOUT:Duration = Duration::from_secs(2);


struct ServerState {
    soft_admin: Option<Sender>,
    soft_controller: Option<Sender>,
    soft_avatar: Option<Sender>,
    tokens: HashMap<Token, u8>,
    game: Option<JoinHandle<()>>,
    game_tx: Option<mpsc::Sender<Vec<u8>>>,
    comm_tx: mpsc::Sender<Vec<u8>>,
    pic_state: Vec<u8>,
    pic_key: String,
    soft_controller_name: Option<String>,
    soft_controller_last_action: SystemTime,
    sc_token : Option<Token>,
    soft_controller_typing: bool,
    soft_controller_last_typing: SystemTime
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

fn send_pic_state(state: &ServerState) {
    println!("Sending pic state");
    let json_command = format!("U{{
        \"command\": \"pic-state\",
        \"state\": {{
            \"CONTROL\": {},
            \"AVATAR\": {},
            \"key\" : \"{}\"
        }}
    }}
    ", state.pic_state[0], state.pic_state[1], state.pic_key);

    if let Some(sc) = &state.soft_controller {
        sc.send(json_command.as_bytes());
    }
    if let Some(sa) = &state.soft_avatar {
        sa.send(json_command.as_bytes());
    }
}

fn send_softbot_state(state: &ServerState) {
    println!("Sending softbot state");
    let controller_name = match state.soft_controller_name {
        Some(ref name) => name,
        None => ""
    };
    let json_command = format!("U{{
        \"command\": \"softbot-state\",
        \"state\": {{
            \"CONTROL\": {},
            \"AVATAR\": {},
            \"softControllerName\" : \"{}\",
            \"softControllerTyping\" : {}
        }}
    }}
    ", 
    if state.soft_controller.is_some() { '1' } else { '0' },
    if state.soft_avatar.is_some() { '1' } else { '0' },
    controller_name,
    if state.soft_controller_typing { "true" } else { "false" },
    );

    if let Some(sc) = &state.soft_controller {
        sc.send(json_command.as_bytes());
    }
    if let Some(sa) = &state.soft_avatar {
        sa.send(json_command.as_bytes());
    }
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
        match role {
            0 ..= 2 => {
                {
                    let targets = [
                        &mut state.soft_controller,
                        &mut state.soft_avatar,
                        &mut state.soft_admin
                    ];
                    if let Some(soft_target) = targets[role as usize] {
                        return Err(SoftError::new("There is already a controller connected. Please try again later!"));
                    } else {
                        *(targets[role as usize]) =  Some(server.ws.clone());
                         state.tokens.insert(server.ws.token(), role);
                         println!("Registration successful");
                         if role as usize == AVATAR_ROLE {
                             if let Some(sc) = targets[0] {
                                 println!("Notifying controller");
                                 sc.send("IAvatar connected!").unwrap();
                             }
                            if let Some(sa) = targets[2] {
                                println!("Notifying admin");
                                sa.send("IAvatar connected!").unwrap();
                            }
                        } 
                         else if role as usize == CONTROL_ROLE {
                             state.soft_controller_name = Some(str::from_utf8(&data[2..]).unwrap().to_string());
                              if let Some(sc) = targets[0] {
                                 println!("Notifying controller");
                                 sc.send("IYou are now in control of Hitodama.").unwrap();
                              }

                              state.soft_controller_last_action = SystemTime::now();
                              state.sc_token = Some(server.ws.token());
                         }
                    }
                }
                send_pic_state(state);
                send_softbot_state(state);
            }

            _ => return Err(SoftError::new("Unknown role"))
        }
    }
    else {
        if let Some(role) = state.tokens.get(&server.ws.token()) {
            if *role as usize == CONTROL_ROLE {
                state.soft_controller_last_action = SystemTime::now();
            }
            match command {
                'S' => {
                    // Start command
                    let app = str::from_utf8(&data[1..4]).unwrap();
                    println!("Start app {:?}", app);
                    if app == "BRK" {
                        println!("Start breakout!");
                        // Check that both players are here
                        if let (Some(sc), Some(sa)) = (&state.soft_controller, &state.soft_avatar) {
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
                    if app == "PIC" {
                        let pic_state = data[4];
                        println!("PIC State! {}", pic_state);
                        state.pic_state[*role as usize] = pic_state;

                        if state.pic_state[CONTROL_ROLE] == READY &&
                            state.pic_state[AVATAR_ROLE] == READY {
                            // Generate a new pic key
                            let start = SystemTime::now();
                            let since_the_epoch = start.duration_since(UNIX_EPOCH).unwrap();
                            state.pic_key = format!("{:?}", since_the_epoch.as_millis());
                            
                        }
                        if
                            state.pic_state[CONTROL_ROLE] >= CHOSE_1 &&
                            state.pic_state[CONTROL_ROLE] <= CHOSE_2 && 
                            state.pic_state[AVATAR_ROLE]  >= CHOSE_1 && 
                            state.pic_state[AVATAR_ROLE] <= CHOSE_2 {
                                
                                println!("Both chose!");
                                state.pic_state[AVATAR_ROLE] += 2;
                                state.pic_state[CONTROL_ROLE] += 2;
                        }
                        if state.pic_state[CONTROL_ROLE] >= DONE_1 &&
                           state.pic_state[AVATAR_ROLE] >= DONE_1 {
                            // Reset!
                            state.pic_state[CONTROL_ROLE] = WAITING;
                            state.pic_state[AVATAR_ROLE] = WAITING;
                        }
                        send_pic_state(state);
                    }
                }
                'C' => {
                    println!("Comm message");
                    // Just send it to the avatar
                    match role {
                        0 | 2 => {
                            if let Some(sa) = &state.soft_avatar {
                                sa.send(data);
                            } else {
                                return Err(SoftError::new("No avatar connected!"))
                            }
                        }
                        1 => {
                            if let Some(sc) = &state.soft_controller {
                                sc.send(data);
                            } else {
                                return Err(SoftError::new("No controller connected!"))
                            }
                        }
                        _ => {}

                    }
                }
                'T' => {
                    println!("Typing!");
                    state.soft_controller_last_typing = SystemTime::now();

                    if !state.soft_controller_typing {
                        state.soft_controller_typing = true;
                        send_softbot_state(state);
                    }
                }
                '>' => {
                    // Send to serial
                    server.motor_tx.send(data);

                }
                _ => return Err(SoftError::new("Unknown command"))
            }
        } else {
            return Err(SoftError::new("Disconnected. Please refresh and try again."))
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
            let targets = [&mut state.soft_controller,&mut state.soft_avatar, &mut state.soft_admin];
            if targets[*role as usize] != &mut None {
                *(targets[*role as usize]) = None;                
                state.pic_state[*role as usize] = 0;
                println!("Disconnected from role {:}", role);
                if *role as usize == AVATAR_ROLE {
                    if let Some(sc) = targets[0] {
                        println!("Notifying controller");
                        sc.send("IAvatar disconnected.").unwrap();
                    }
                    state.pic_state[CONTROL_ROLE] = 0;
                } else if *role as usize == CONTROL_ROLE {
                    state.pic_state[AVATAR_ROLE] = 0;
                    state.soft_controller_name = None;                    
                    state.sc_token = None;
                }
            } 
        }
        send_softbot_state(state);
        state.tokens.remove(&self.ws.token());
    }
}

pub fn start(
    config: Arc<Config>,
    sensing_rx: mpsc::Receiver<Vec<u8>>,
    motor_tx: mpsc::Sender<Vec<u8>>

) {
    println!("\nSpawning server on port {}", config.server.port);

    let (comm_out, comm_in) = channel();

    let mut pic_state = vec![0,0,0];

    let state = Arc::new(Mutex::new(ServerState {
        soft_controller: None,
        soft_admin: None,
        soft_avatar: None,
        tokens: HashMap::new(),
        game: None,
        game_tx: None,
        comm_tx: comm_out.clone(),
        pic_state : pic_state,
        pic_key : String::new(),
        soft_controller_name : None,
        soft_controller_last_action: UNIX_EPOCH,
        sc_token : None,
        soft_controller_typing: false,
        soft_controller_last_typing: UNIX_EPOCH
    }));

    let comm_state = state.clone();

    let sensing_state = state.clone();

    let sensing_thread = thread::spawn(move || {
        while let Ok(mut msg) = sensing_rx.recv() {
            let command = msg[0] as char;
            match(command) {
                'S' => {
                    let state = & sensing_state.lock().unwrap();
                    match msg[1] as char {
                        'A' => {
                            println!("Arm sensing message! {}", String::from_utf8(msg.clone()).unwrap());
                            if let Some(sa) = & state.soft_avatar {
                               sa.send(msg.clone()).unwrap();
                            }
                            if let Some(sc) = & state.soft_controller {
                               sc.send(msg.clone()).unwrap();
                            }
                        }
                        'P' => {
                       //    println!("Pressure sensing message!");
                            if let Some(sa) = & state.soft_admin {
                               sa.send(msg).unwrap();
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
                    if let Some(sa) = & state.soft_admin {
                       sa.send(msg).unwrap();
                    }
                }
                _ => {
                    println!("Unknown sensing command! {}",command);
                }
            }
        }
    }); 
    let timeout_state = state.clone();
    let timeout_thread = thread::spawn(move || {
        loop {
            {
                let mut state =  &mut *timeout_state.lock().unwrap();
                let mut state_changed:bool = false;
                {
                    let mut sc_handle = &mut state.soft_controller;
                    if sc_handle.is_some() {
                        let timeSinceLastAction = 
                            SystemTime::now().duration_since(state.soft_controller_last_action).unwrap();
                        //println!("Time since last action: {:?}" ,timeSinceLastAction);
                        if timeSinceLastAction > CONTROLLER_TIMEOUT {
                            state_changed = true;
                            println!("Time to go!");
                            {
                                let sc = sc_handle.as_ref().unwrap();
                                sc.send("EYou were disconnected due to inactivity. Please refresh to try again.").unwrap();
                            }

                            *(sc_handle) = None;
                            if let Some(token) = state.sc_token {
                                println!("Removing sc token");
                                state.tokens.remove(&token);
                            }
                            state.sc_token = None;
                            state.soft_controller_name = None;
                        }
                        if state.soft_controller_typing {
                            let timeSinceLastTyping = 
                                SystemTime::now().duration_since(state.soft_controller_last_typing).unwrap();
                            if timeSinceLastTyping > TYPING_TIMEOUT {
                                println!("Stopped typing!");
                                state.soft_controller_typing = false;
                                state_changed = true;
                            }
                        }
                    }
                }
                if (state_changed) {
                    send_softbot_state(state);
                }
            }
            thread::sleep(Duration::from_secs(1));
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
