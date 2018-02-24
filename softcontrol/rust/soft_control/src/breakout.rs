use std::thread;
use std::time::Duration;
use std::sync::{Arc};
use std::sync::mpsc;
use Config;

struct Game {
    tick: u32
}

pub fn start(
    config: Arc<Config>,
    breakout_rx: mpsc::Receiver<Vec<u8>>
) {
    let mut game = Game {
        tick: 0
    };
    println!("Breakout game starting {:?}",config);
    /*
    loop {
        game.tick += 1
    }*/
    while let Ok(msg) = breakout_rx.recv() {
        println!("Breakout msg! {:?}", msg);
    }
}
