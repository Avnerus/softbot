use std::thread;
use std::time::Duration;

use Config;

struct Game {
    tick: u32
}

pub fn start(config: Box<Config>) {
    let game = Game {
        tick: 0
    };
    loop {
        thread::sleep(Duration::from_millis(10));
    }

}
