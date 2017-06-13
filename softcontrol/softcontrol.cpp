#include <iostream>

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>

#include "SerialPort.h"

typedef websocketpp::server<websocketpp::config::asio> server;
SerialPort serial;

void on_message(websocketpp::connection_hdl hdl, server::message_ptr msg) {
        std::cout << msg->get_payload() << std::endl;
        serial.write_some(msg->get_payload());
}

int main() {
    server print_server;
    bool rv = serial.start("/dev/ttyACM0", 9600);
    if (rv == false) {
                return -1;

    }   

    print_server.set_message_handler(&on_message);

    print_server.init_asio();
    print_server.listen(9002);
    print_server.start_accept();

    print_server.run();
}
