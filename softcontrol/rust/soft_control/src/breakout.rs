#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;
mod breakout_state;
use breakout_state::BRState;

#[wasm_bindgen]
pub struct BreakoutAPI {
    state: breakout_state::BRState
}
/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl BreakoutAPI {
    pub fn new() -> BreakoutAPI {
        let state = BRState::new();

        BreakoutAPI {
            state
        }
    }

    pub fn state(&self) -> *const BRState {
        &self.state as *const BRState
    }

    pub fn tick(&mut self) {
        self.state.tick();
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Helloooooo, {}!", name));
}

pub fn step() {
    println!("Breakout-Step");
}
