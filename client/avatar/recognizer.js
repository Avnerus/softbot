export default class Recognizer {
    constructor(socketMessenger, container) {
        console.log("Recognizer constructed!")
        this.socketMessenger = socketMessenger;
        this.container = container;
    }
    init() {
        console.log("Init recognizer", this.container);

        this.container.find('#recognize-button').click(() => {
            this.start();
        });
    }

    start() {
        console.log("Start recognizing!");
        console.log("Fetching token");
        fetch('/api/token').then(res => {
              if (res.status != 200) {
                throw new Error('Error retrieving auth token');
              }
              return res.text();
        })
        .then( (token) => {
            console.log("Access token:", token);
        });
    }
}
