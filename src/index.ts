export interface IpcData {

  /**
   * 数据类型
   */
  type: BufferEncoding;

  /**
   * 数据的具体值,本质为字符串,hex为16进制字符串'0e3a'
   */
  data: string;
}
/**
 * ipc通信的数据类型,用来对数据进行解码编码
 */
export class IpcDataHelper {

  /**
   * Uint8 array 转换成 buffer
   * @param u8 输入的Uint8 array
   * @returns 转换后的buffer
   */
  static uint8ArrayToBuffer(u8: Uint8Array): Buffer {
    return Buffer.from(u8);
  }

  /**
   * Base64转换为buffer
   * @param base64 输入的base64
   * @returns 转换后的buffer
   */
  static base64ToBuffer(base64: string): Buffer {
    const buff = Buffer.from(base64, 'base64');
    return buff;
  }

  /**
   * hex转换为buffer
   * @param hex 输入的hex
   * @returns 转换后的buffer
   */
  static hexToBuffer(hex: string): Buffer {
    return Buffer.from(hex, 'hex');
  }
  /**
   * string转换为buffer
   * @param string 输入的字符串
   * @param encoding 字符串的编码
   * @returns 转换后的buffer
   */
  static stringToBuffer(str: string, encoding: BufferEncoding = 'utf8'): Buffer {
    const result = Buffer.from(str, encoding);
    return result;
  }

  /**
   * Buffer转换为hex
   * @param buffer 输入的buffer
   * @returns 返回的hex字符串
   */
  static bufferToHex(buffer: Buffer): string {
    const result = buffer.toString('hex');
    return result;
  }

  /**
   * Buffer转换为hex
   * @param buffer 输入的buffer
   * @param encoding 字符串的编码
   * @returns 返回的字符串
   */
  static bufferToString(buffer: Buffer, encoding: BufferEncoding = 'utf8'): string {
    const result = buffer.toString(encoding);
    return result;
  }

  /**
   * Buffer转换为base64
   * @param buffer 输入的buffer
   * @returns 返回的字符串
   */
  static bufferToBase64(buff: Buffer): string {
    return buff.toString('base64');
  }

  /**
   * Buffer 转换为 uint8Array
   * @param buffer 输入的buffer
   * @returns 返回的uint8Array
   */
  static bufferToUint8Array(buffer: Buffer): Uint8Array {
    return new Uint8Array(buffer);
  }

  /**
   * 将数据打包成IpcData格式
   * @param type 转换后字符串的编码
   * @param inputData 输入的byte数据
   * @returns 生成的IpcData对象
   */
  static encode(type: BufferEncoding, inputData: Uint8Array | Buffer): IpcData {
    let stringValue: string | null = null;
    if (inputData instanceof Uint8Array) {
      inputData = IpcDataHelper.uint8ArrayToBuffer(inputData);
    }
    stringValue = IpcDataHelper.bufferToString(inputData as Buffer, type);
    const encodeData: any = {
      type,
      data: stringValue
    };
    return encodeData;
  }
  /**
   * 将数据根据编码解析成buffer
   * @param type 转换的字符串的编码
   * @param inputData 输入的string数据
   * @returns 生成的buffer
   */
  static decode(type: BufferEncoding, inputData: string): Buffer {
    return IpcDataHelper.stringToBuffer(inputData, type);
  }
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
