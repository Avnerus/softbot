use std::sync::{Arc,Mutex};
use ws::{listen, CloseCode, Message, Sender, Handler, Handshake, Result};
use std::thread::{JoinHandle};
use std::thread;
use std::sync::mpsc;

use Config;
use breakout;

// WebSocket connection handler for the server connection
struct Server {
   ws: Sender,
  //  serial: ThreadOut<String>,
   soft_controller: Arc<Mutex<Option<Sender>>>,
   breakout: Option<JoinHandle<()>>,
   config: Arc<Config>,
   breakout_tx: Option<mpsc::Sender<Vec<u8>>>
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
        }

        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        println!("Client disconnected! ({:?}, {})",code,reason);
        let mut sc = self.soft_controller.lock().unwrap();
        *sc = None;
    }
}

pub fn start(
    server_sc: Arc< Mutex < Option< Sender > > >, 
    config: Arc<Config>
) {
    println!("Spawning server on port {}", config.server.port);

    listen(("127.0.0.1",config.server.port), move |out| {
        println!("Connection");
        Server {
            ws: out,
            soft_controller: server_sc.clone(),
            config: Arc::clone(&config),
            breakout: None,
            breakout_tx: None
        }
    }).unwrap();
}
