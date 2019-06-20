export const inflateTo = (socketController, chamber, value, time = 0) => {
    return new Promise((resolve, reject) => {
        socketController.sendSerialCommand('C', chamber, 255 * value);
        if (time > 0) {
            setTimeout(() => {
                resolve();
            }, time)
        } else {
            resolve();
        }
    })
}
export const deflate = (socketController,chamber) => {
    socketController.sendSerialCommand('C', chamber, 0);
}
export const stop = (socketController,chamber) => {
    socketController.sendSerialCommand('S', chamber);
}
