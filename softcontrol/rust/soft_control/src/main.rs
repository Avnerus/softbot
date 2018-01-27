extern crate ws;

use ws::listen;

fn main() {
    println!("Hello, Rusty WS server!");

    listen("127.0.0.1:3012", |out| {
      move |msg| {
         println!("Received message {}", msg);
         out.send(msg)
      }
    }).unwrap()
}
