use std::{thread,time};
use std::time::Duration;
use std::sync::{Arc,Mutex};
use std::sync::mpsc;
use Config;

struct GameState {
    tick: u32
}

pub fn start(
    config: Arc<Config>,
    game_rx: mpsc::Receiver<Vec<u8>>,
    comm_tx: mpsc::Sender<Vec<u8>>
) {
    let mut game_state = Arc::new(Mutex::new(GameState {
        tick: 0
    }));
    println!("Breakout game starting {:?}",config);
    comm_tx.send([1,2,3].to_vec());

    let game_loop = 
        thread::Builder::new().name("game_loop".to_owned()).spawn(move || {
            game_loop(game_state.clone());
    }).unwrap();
    while let Ok(msg) = game_rx.recv() {
        println!("Breakout msg! {:?}", msg);
    }

}

fn game_loop(game_state: Arc<Mutex<GameState>>) {
    loop {
        let mut game_state = game_state.lock().unwrap();
        game_state.tick += 1;
        //breakout::step();
        thread::sleep(time::Duration::from_millis(1000));
    }
}
