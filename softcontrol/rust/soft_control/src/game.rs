use std::{thread,time};
use std::time::Duration;
use std::sync::{Arc,Mutex};
use std::sync::mpsc;
use Config;
use byteorder::{LittleEndian, WriteBytesExt};

use breakout_state::BRState;


pub fn start(
    config: Arc<Config>,
    game_rx: mpsc::Receiver<Vec<u8>>,
    comm_tx: mpsc::Sender<Vec<u8>>
) {
    let mut br_state_ptr = Arc::new(Mutex::new(BRState::new()));
    let mut br_state = br_state_ptr.lock().unwrap();
    
    println!("Breakout game starting {:?}",config);

    // Setup messages
    let mut p0_msg = vec![0];
    p0_msg.append(&mut "PZ".as_bytes().to_vec());
    p0_msg.append(&mut [0].to_vec());
    p0_msg.write_u32::<LittleEndian>(br_state.setup.width).unwrap();
    p0_msg.write_u32::<LittleEndian>(br_state.setup.height).unwrap();

    comm_tx.send(p0_msg);

    let mut p1_msg = vec![1];
    p1_msg.append(&mut "PZ".as_bytes().to_vec());
    p1_msg.append(&mut [1].to_vec());
    p1_msg.write_u32::<LittleEndian>(br_state.setup.width).unwrap();
    p1_msg.write_u32::<LittleEndian>(br_state.setup.height).unwrap();

    comm_tx.send(p1_msg);

    /*
    let game_loop = 
        thread::Builder::new().name("game_loop".to_owned()).spawn(move || {
            game_loop(br_state_ptr.clone());
    }).unwrap();
    while let Ok(msg) = game_rx.recv() {
        println!("Breakout msg! {:?}", msg);
    }*/

}

fn game_loop(br_state: Arc<Mutex<BRState>>) {
    loop {
        /*
        let mut game_state = game_state.lock().unwrap();
        game_state.tick += 1;
        //breakout::step();*/
        thread::sleep(time::Duration::from_millis(1000));
    }
}
