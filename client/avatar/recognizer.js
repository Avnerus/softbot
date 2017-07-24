import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone';

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

        this.socketMessenger.on("recognize", (data) => {
            if (data.start) {
                this.start();
            }
            else if (data.stop) {
                this.stop();
            }
        })
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
            this.handleStream(recognizeMicrophone({"token": token, objectMode: true, model: "ja-JP_BroadbandModel"}));
            //this.handleStream(recognizeMicrophone({"token": token, objectMode: true}));
        });
    }

    stop() {
        console.log("Stopping recognizing!");
        if (this.stream) {
              this.stream.stop();
              this.stream.removeAllListeners();
              this.stream.recognizeStream.removeAllListeners();
        }
    }

    handleStream(stream) {
        console.log("Stream!", stream);
        this.stop();
        this.stream = stream;
        stream.on('data', (msg) => {this.handleFormattedMessage(msg)}).on('end', this.handleTranscriptEnd).on('error', this.handleError);

        stream.recognizeStream.on('end', () => {
            console.log("Stream ended");
        });
    }

    handleFormattedMessage(msg) {
        console.log("Message!", msg, msg.results[0].alternatives[0]);
        if (msg.results[0].final && msg.results[0].alternatives[0].confidence >= 0.3) {
            // Send to socket
            this.socketMessenger.emit('recognized-speech', {
                text: msg.results[0].alternatives[0].transcript
            });
        }
    }

    handleTranscriptEnd() {
        console.log("Transcript end");
    }
    handleError(err, extra) {
        console.error(err, extra);
    }
}
