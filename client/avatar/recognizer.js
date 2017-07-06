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
            this.handleStream(recognizeMicrophone({"token": token, objectMode: true}));
        });
    }

    handleStream(stream) {
        console.log("Stream!", stream);
        if (this.stream) {
              this.stream.stop();
              this.stream.removeAllListeners();
              this.stream.recognizeStream.removeAllListeners();
        }
        this.stream = stream;
        stream.on('data', this.handleFormattedMessage).on('end', this.handleTranscriptEnd).on('error', this.handleError);

        stream.recognizeStream.on('end', () => {
            console.log("Stream ended");
        });
    }

    handleFormattedMessage(msg) {
        if (msg.results[0].final) {
            console.log("Final Message!", msg.results[0].alternatives[0].transcript);
        }
    }

    handleTranscriptEnd() {
        console.log("Transcript end");
    }
    handleError(err, extra) {
        console.error(err, extra);
    }
}
