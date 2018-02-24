use std::thread;
use std::time::Duration;
use std::sync::{Arc};

use Config;

struct Game {
    tick: u32
}

pub fn start(config: Arc<Config>) {
    let mut game = Game {
        tick: 0
    };
    println!("Breakout game starting {:?}",config);
    loop {
        game.tick += 1;
        thread::sleep(Duration::from_millis(10));
    }

}
