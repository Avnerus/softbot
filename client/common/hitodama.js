export const inflateTo = (socketController, chamber, value) => {
    socketController.sendSerialCommand('C', chamber, 255 * value);
}
export const deflate = (socketController,chamber) => {
    socketController.sendSerialCommand('C', chamber, 0);
}
export const stop = (socketController,chamber) => {
    socketController.sendSerialCommand('S', chamber);
}
