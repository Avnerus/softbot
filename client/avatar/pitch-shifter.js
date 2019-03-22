export default class PitchShifter {
    constructor(pitchRatio, overlapRatio, grainSize) {
        this.pitchRatio = pitchRatio;
        this.overlapRatio = overlapRatio;
        this.grainSize = grainSize;

        this.buffer = new Float32Array(grainSize * 2);
        this.grainWindow = hannWindow(grainSize);
    }
    onaudioprocess(event) {
        console.log("Audio process!!");
        let inputData = event.inputBuffer.getChannelData(0);
        let outputData = event.outputBuffer.getChannelData(0);

        for (let i = 0; i < inputData.length; i++) {

            // Apply the window to the input buffer
            inputData[i] *= this.grainWindow[i];

            // Shift half of the buffer
            this.buffer[i] = this.buffer[i + this.grainSize];

            // Empty the buffer tail
            this.buffer[i + this.grainSize] = 0.0;
        }

        // Calculate the pitch shifted grain re-sampling and looping the input
        let grainData = new Float32Array(this.grainSize * 2);
        for (let i = 0, j = 0.0;
             i < this.grainSize;
             i++, j += this.pitchRatio) {

            let index = Math.floor(j) % this.grainSize;
            let a = inputData[index];
            let b = inputData[(index + 1) % this.grainSize];
            grainData[i] += linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
        }

        // Copy the grain multiple times overlapping it
        for (let i = 0; i < this.grainSize; i += Math.round(this.grainSize * (1 - this.overlapRatio))) {
            for (let j = 0; j <= this.grainSize; j++) {
                this.buffer[i + j] += grainData[j];
            }
        }

        // Output the first half of the buffer
        for (let i = 0; i < this.grainSize; i++) {
            outputData[i] = this.buffer[i];
        }
    }

}

function hannWindow (length) {
        let window = new Float32Array(length);
        for (var i = 0; i < length; i++) {
            window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
        }
        return window;
};

function linearInterpolation (a, b, t) {
        return a + (b - a) * t;
};
