use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub struct SoftError {
    pub message: String
}

impl SoftError {
    pub fn new(msg: &str) -> SoftError {
        SoftError{message: msg.to_string()}
    }
}

impl fmt::Display for SoftError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f,"{}",self.message)
    }
}

impl Error for SoftError {
    fn description(&self) -> &str {
        &self.message
    }
}
