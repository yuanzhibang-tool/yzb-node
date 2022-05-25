/**
 * ipc通信的数据类型,用来对数据进行解码编码
 */
export class IpcDataHelper {
  static toBase64(u8: Uint8Array) {
    return Buffer.from(u8).toString('base64');
  }
  static fromBase64(base64: string) {
    const buff = Buffer.from(base64, 'base64');
    return buff;
  }
  static hexToBytes(hex: string) {
    const u8Array = new Uint8Array(hex.length / 2);
    for (let c = 0; c < hex.length; c += 2) {
      const subString = hex.substring(c, c + 2);
      const value = parseInt(subString, 16);
      const index = c / 2;
      u8Array[index] = value;
    }
    return u8Array;
  }

  static bytesToHex(bytes: Uint8Array) {
    const hex: Array<string> = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < bytes.length; i++) {
      const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      // tslint:disable-next-line: no-bitwise
      hex.push((current >>> 4).toString(16));
      // tslint:disable-next-line: no-bitwise
      hex.push((current & 0xF).toString(16));
    }
    return hex.join('');
  }

  static encode(type: 'base64' | 'hex' | 'string', data: Uint8Array) {
    let stringValue: string | null = null;
    switch (type) {
      case 'base64':
        stringValue = IpcDataHelper.toBase64(data);
        break;
      case 'hex':
        stringValue = IpcDataHelper.bytesToHex(data);
        break;
      case 'string':
        stringValue = IpcDataHelper.toBase64(data);
        break;
      default:
        break;
    }
    return {
      type,

    };
  }
  static decode(type: 'base64' | 'hex' | 'string', data: string) { }
}
/**
 * 回调函数中的发送给渲染进程的辅助类
 */
export class IpcSender {
  /**
   * 内部变量无需关注,用以进行回调的识别字符串
   */
  identity: string;

  /**
   * 创建类实例
   * @param identity 用以进行回调的识别字符串
   */
  constructor(identity: string) {
    this.identity = identity;
  }

  /**
   * 用以在topic消息回调中,向渲染进程回调next/then结果
   * @param [result] 需要回调给渲染进程的结果值
   * @returns 无需关注该返回值,该返回值用以进行单元测试
   */
  next(result: any = null) {
    return this.sendMessageWithType('next', result);
  }

  /**
   * 用以在topic消息回调中,向渲染进程回调error错误
   * @param [error] 需要回调给渲染进程的错误值
   * @returns 无需关注该返回值,该返回值用以进行单元测试
   */
  error(error: any = null) {
    return this.sendMessageWithType('error', error);
  }

  /**
   * 内部调用方法,无需关注,发送回调消息
   * @param type 消息类型,是next消息还是error消息
   * @param result 对应的错误还是结果值
   * @returns 无需关注该返回值,该返回值用以进行单元测试
   */
  sendMessageWithType(type: string, result: any) {
    const message = this.getMessage(type, result);
    if (process.send) {
      return process.send(message);
    }
  }

  /**
   * 内部调用方法,无需关注,获取消息体
   * @param type 消息类型,是next消息还是error消息
   * @param result 对应的错误还是结果值
   * @returns 无需关注该返回值,该返回值用以进行单元测试
   */
  getMessage(type: string, result: any) {
    const message = {
      __type: 'yzb_ipc_node_message',
      identity: this.identity,
      data: result,
      type,
    };
    return message;
  }
}


/**
 * 拓展进程的主体类
 */
export class IpcNode {

  /**
   * 内部变量无需关注,on保存的回调保存map
   */
  messageCallbackMap = new Map<string, (sender: IpcSender, message: any) => void>();

  /**
   * 内部变量无需关注,once保存的回调保存map
   */
  onceMessageCallbackMap = new Map<string, (sender: IpcSender, message: any) => void>();
  /**
   * 创建类实例
   */
  constructor() {
    process.on('message', (messageObject: any) => {
      if (messageObject !== null && typeof messageObject === 'object') {
        if (messageObject.hasOwnProperty('__type')) {
          const messageType = messageObject.__type;
          if (messageType === 'yzb_ipc_node_message') {
            // 此为ipc消息类型
            const messageIdentity = messageObject.identity;
            const data = messageObject.data;
            const messageTopic = data.topic;
            const messageTopicMessage = data.message;
            // 查找对应的回调,有则执行,无则不执行
            const sender = new IpcSender(messageIdentity);
            if (this.messageCallbackMap.has(messageTopic)) {
              const callback = this.messageCallbackMap.get(messageTopic);
              if (callback) {
                callback(sender, messageTopicMessage);
              }
            } else if (this.onceMessageCallbackMap.has(messageTopic)) {
              const callback = this.onceMessageCallbackMap.get(messageTopic);
              if (callback) {
                callback(sender, messageTopicMessage);
              }
              // 执行完毕后,清除回调
              this.onceMessageCallbackMap.delete(messageTopic);
            } else {
              // 没有回调可执行
            }
          }
        }
      }
    });
  }

  /**
   * 监听渲染进程发送来的topic消息,除非取消监听或者拓展进程生命周期结束,否则该监听一直有效
   * @param topic 监听的topic
   * @param callback 收到topic消息的回调,sender用以向渲染进程发送next/then,或者error回调结果,message为topic消息的消息体
   */
  on(topic: string, callback: (sender: IpcSender, message: any) => void) {
    if (
      this.messageCallbackMap.has(topic) ||
      this.onceMessageCallbackMap.has(topic)
    ) {
      throw new Error('you can not listen a topic twice!');
    }
    this.messageCallbackMap.set(topic, callback);
  }

  /**
   * 和on方法的作用一致,只不过回调一次后自动移除该回调
   * @param topic 监听的topic
   * @param callback 收到topic消息的回调,sender用以向渲染进程发送next/then,或者error回调结果,message为topic消息的消息体
   */
  once(topic: string, callback: (sender: IpcSender, message: any) => void) {
    if (
      this.messageCallbackMap.has(topic) ||
      this.onceMessageCallbackMap.has(topic)
    ) {
      throw new Error('you can not listen a topic twice!');
    }
    this.onceMessageCallbackMap.set(topic, callback);
  }

  /**
   * 移除单个topic消息回调,不区分是通过on或者once添加的回调
   * @param topic 移除监听的topic
   */
  removeListener(topic: string) {
    this.messageCallbackMap.delete(topic);
    this.onceMessageCallbackMap.delete(topic);
  }

  /**
   * 移除所有监听的topic,不区分是通过on或者once添加的回调
   */
  removeAllListener() {
    this.messageCallbackMap.clear();
    this.onceMessageCallbackMap.clear();
  }

  /**
   * 向渲染进程发送topic消息
   * @param topic 消息的topic
   * @param topicMessage tpoic的消息的消息体,默认为空对象
   * @returns  该return用以进行单元测试无需关注
   */
  send(topic: string, topicMessage: any = null) {
    const message = {
      __type: 'yzb_ipc_renderer_message',
      topic,
      message: topicMessage,
    };
    if (process.send) {
      return process.send(message);
    }
  }
}

export const ipc = new IpcNode();
