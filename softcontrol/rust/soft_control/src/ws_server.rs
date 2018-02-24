use std::sync::{Arc,Mutex};
use ws::{listen, CloseCode, Message, Sender, Handler, Handshake, Result};
use std::thread::{JoinHandle};
use std::thread;

use Config;
use breakout;

// WebSocket connection handler for the server connection
struct Server {
   ws: Sender,
  //  serial: ThreadOut<String>,
   soft_controller: Arc<Mutex<Option<Sender>>>,
   breakout: Option<JoinHandle<()>>,
   config: Arc<Config>

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
        if msg.into_text().unwrap() == "SBREAKOUT" {
            println!("Start breakout!");
            let breakout_config = Arc::clone(&self.config);
            self.breakout = Some(
                thread::Builder::new().name("breakout".to_owned()).spawn(move || {
                    breakout::start(breakout_config);
            }).unwrap());

            self.ws.send("PBREAKOUT")?;
        }
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        println!("Client disconnected! ({:?}, {})",code,reason);
        let mut sc = self.soft_controller.lock().unwrap();
        *sc = None;
    }
}

pub fn start(server_sc: Arc< Mutex < Option< Sender > > >, config: Arc<Config>) {
    println!("Spawning server on port {}", config.server.port);
    listen(("127.0.0.1",config.server.port), |out| {
        println!("Connection");
        Server {
            ws: out,
            soft_controller: server_sc.clone(),
            breakout: None,
            config: Arc::clone(&config)
        }
    }).unwrap();
}
