class IpcMainSender {
  next = (result) => {};
  error = (error) => {};
}
class IpcMain {
  messageCallbackMap = new Map();
  onceMessageCallbackMap = new Map();
  constructor() {
    process.on('message', (messageObject: any) => {
      const data = messageObject.data;
      const messageTopic = data.topic;
      const messageTopicData = data.data;
    });
  }
  on(topic, callback) {
    this.messageCallbackMap.set(topic, callback);
  }
  once(topic, callback) {
    this.onceMessageCallbackMap.set(topic, callback);
  }
  send() {}
}
