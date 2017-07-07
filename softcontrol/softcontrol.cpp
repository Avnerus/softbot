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

int main(int argc, char *argv[]) {
    if (argc != 2) {
        std::cout << "Usage: " << argv[0] << " <Arduino USB device>" << std::endl;
    } else {
        server print_server;
        bool rv = serial.start(argv[1], 9600);
        if (rv == false) {
            std::cout << "Failed to connect to serial port. Exiting." << std::endl;
            return -1;
        }   

        print_server.set_message_handler(&on_message);

        print_server.init_asio();
        print_server.listen(9002);
        print_server.start_accept();

        print_server.run();
    }
}
