import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone';

export default class Recognizer {
    constructor(socketController,  expression,  container) {
        console.log("Recognizer constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.container = container;
        this.wasStarted = false;
    }
    init() {
        console.log("Init recognizer", this.container);

        this.container.find('#recognize-button').click(() => {
            this.start();
        });

        this.socketController.on("recognize", (data) => {
            if (data.start) {
                this.wasStarted = true;
                this.currentData = data;
                this.start(data);
            }
            else if (data.stop) {
                this.wasStarted = false;
                this.stop();
            }
        })

        this.socketController.subscribeToPrefix('R', (message) => {
            var view = new DataView(message.data);
            let ascii = view.getUint8(0);
            if (ascii == 49) {
                console.log("Add class");
                this.container.addClass("on");
            } else {
                this.container.removeClass("on");
            }
        });

        events.on("voice_start", () => {
            if (this.wasStarted) {
                this.stop();
            }
        })
        events.on("voice_end", () => {
            if (this.wasStarted) {
                this.start(this.currentData);
            }
        })
    }

    start(data) {
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
            // this.handleStream(recognizeMicrophone({"token": token, objectMode: true, model: "ja-JP_BroadbandModel"}));
            //this.handleStream(recognizeMicrophone({"token": token, objectMode: true, model: "pt-BR_BroadbandModel"}));
            //this.handleStream(recognizeMicrophone({"token": token, objectMode: true, model: "zh-CN_BroadbandModel"}));

            console.log("Recognize Model: ", data.model, "Translate: " + data.translate);
            this.handleStream(recognizeMicrophone({"token": token, objectMode: true, model: data.model}));
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
            this.socketController.emit('recognized-speech', {
                text: msg.results[0].alternatives[0].transcript,
                translate: this.currentData.translate
            });

            // Express
            this.expression.applyPoseMilliseconds("Thinking", 2000);
        }
    }

    handleTranscriptEnd() {
        console.log("Transcript end");
    }
    handleError(err, extra) {
        console.error(err, extra);
    }
}
