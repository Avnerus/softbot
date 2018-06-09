pub struct BRState {
    p1_y: u32,
    p1_dy: u32,
    p2_y: u32,
    p2_dy: u32
}

impl BRState {
    pub fn new() -> BRState {
        BRState {
            p1_y: 0,
            p1_dy: 0,
            p2_y: 0,
            p2_dy: 0
        }
    }
    pub fn tick(&mut self) {
        self.p1_y += 1;
    }
}
