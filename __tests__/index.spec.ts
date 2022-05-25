import { IpcSender, IpcNode, IpcDataHelper } from '../src/index';

class MockProcess {
    messageCallback: ((message: any) => void) | null = null;
    send(message: any) {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    }
    on(messageType: string, callback: (message: any) => void) {
        if (messageType === 'message') {
            this.messageCallback = callback;
        }
    }
}

(global as any).process = new MockProcess();

describe('IpcDataHelper check', () => {
    test('check bufferToBase64', () => {
        const inputValue = Buffer.alloc(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.bufferToBase64(inputValue as any);
        const expectResult = 'AQIDBA==';
        expect(result).toEqual(expectResult);
    });
    test('check base64ToBuffer', () => {
        const inputValue = 'AQIDBA==';
        const result = IpcDataHelper.base64ToBuffer(inputValue);
        const expectResult = Buffer.alloc(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });
    test('check hexToBuffer', () => {
        const inputValue = '01020304';
        const result = IpcDataHelper.hexToBuffer(inputValue);
        const expectResult = Buffer.alloc(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });

    test('check bufferToHex', () => {
        const inputValue = Buffer.alloc(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.bufferToHex(inputValue);
        const expectResult = '01020304';
        expect(result).toEqual(expectResult);
    });

    test('check bufferToUint8Array', () => {
        const inputValue = Buffer.alloc(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.bufferToUint8Array(inputValue);
        const expectResult = new Uint8Array(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });

    test('check uint8ArrayToBuffer', () => {
        const inputValue = new Uint8Array(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.uint8ArrayToBuffer(inputValue);
        const expectResult = Buffer.alloc(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });

    test('check encode base64', () => {
        const inputValue = new Uint8Array(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.encode('base64', inputValue);
        const expectResult = {
            type: 'base64',
            data: 'AQIDBA=='
        };
        expect(result).toEqual(expectResult);

        const inputValue1 = Buffer.alloc(4);
        inputValue1[0] = 0x01;
        inputValue1[1] = 0x02;
        inputValue1[2] = 0x03;
        inputValue1[3] = 0x04;
        const result1 = IpcDataHelper.encode('base64', inputValue1);
        expect(result1).toEqual(expectResult);
    });

    test('check encode hex', () => {
        const inputValue = new Uint8Array(4);
        inputValue[0] = 0x01;
        inputValue[1] = 0x02;
        inputValue[2] = 0x03;
        inputValue[3] = 0x04;
        const result = IpcDataHelper.encode('hex', inputValue);
        const expectResult = {
            type: 'hex',
            data: '01020304'
        };
        expect(result).toEqual(expectResult);

        const inputValue1 = Buffer.alloc(4);
        inputValue1[0] = 0x01;
        inputValue1[1] = 0x02;
        inputValue1[2] = 0x03;
        inputValue1[3] = 0x04;
        const result1 = IpcDataHelper.encode('hex', inputValue1);
        expect(result1).toEqual(expectResult);
    });

    test('check decode base64', () => {
        const inputValue = 'AQIDBA==';
        const result = IpcDataHelper.decode('base64', inputValue);
        const expectResult = Buffer.alloc(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });

    test('check decode hex', () => {
        const inputValue = '01020304';
        const result = IpcDataHelper.decode('hex', inputValue);
        const expectResult = Buffer.alloc(4);
        expectResult[0] = 0x01;
        expectResult[1] = 0x02;
        expectResult[2] = 0x03;
        expectResult[3] = 0x04;
        expect(result).toEqual(expectResult);
    });

});

describe('IpcSender check', () => {
    test('check constructor', () => {
        const identity = '123456';
        const instance = new IpcSender(identity);
        expect(instance.identity).toEqual(identity);
    });

    test('check getMessage', () => {
        const identity = '123456';
        const instance = new IpcSender(identity);
        const messageData = { k1: 'v1' };
        const messageType = 'test_type';
        const message = instance.getMessage(messageType, messageData);
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
            type: messageType,
        };
        expect(message).toEqual(expectMessage);
    });

    test('check sendMessageWithType', () => {
        const identity = '123456';
        const instance = new IpcSender(identity);
        const messageData = { k1: 'v1' };
        const messageType = 'test_type';
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
            type: messageType,
        };
        instance.sendMessageWithType(messageType, messageData);
        expect.assertions(1);
        (instance.sendMessageWithType(messageType, messageData) as any).then((message) => {
            expect(message).toEqual(expectMessage);
        });
    });

    test('check next', () => {
        const identity = '123456';
        const instance = new IpcSender(identity);
        const messageData = { k1: 'v1' };
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
            type: 'next',
        };
        expect.assertions(1);
        (instance.next(messageData) as any).then((message) => {
            expect(message).toEqual(expectMessage);
        });
    });

    test('check error', () => {
        const identity = '123456';
        const instance = new IpcSender(identity);
        const messageData = { k1: 'v1' };
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
            type: 'error',
        };
        expect.assertions(1);
        (instance.error(messageData) as any).then((message) => {
            expect(message).toEqual(expectMessage);
        });
    });
});

describe('IpcNode check', () => {
    test('check on', () => {
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testTopic = 'test-topic';
        instance.on(testTopic, testOnCallback);
        const storeCallback = instance.messageCallbackMap.get(testTopic);
        expect(storeCallback).toEqual(testOnCallback);
    });

    test('check on twice error', () => {
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testOnCallback1 = (sender: IpcSender, message): void => { console.error(message); };
        const testTopic = 'test-topic';
        expect.assertions(5);
        instance.on(testTopic, testOnCallback);
        try {
            instance.on(testTopic, testOnCallback1);
        } catch (error: any) {
            expect(error.message).toEqual('you can not listen a topic twice!');
        }
        expect(instance.messageCallbackMap.size).toEqual(1);
        expect(instance.messageCallbackMap.get(testTopic)).toEqual(testOnCallback);

        try {
            instance.once(testTopic, testOnCallback1);
        } catch (error: any) {
            expect(error.message).toEqual('you can not listen a topic twice!');
        }
        expect(instance.onceMessageCallbackMap.size).toEqual(0);
    });

    test('check once', () => {
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testTopic = 'test-topic';
        instance.once(testTopic, testOnCallback);
        const storeCallback = instance.onceMessageCallbackMap.get(testTopic);
        expect(storeCallback).toEqual(testOnCallback);
    });

    test('check once twice error', () => {
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testOnCallback1 = (sender: IpcSender, message): void => { console.error(message); };
        const testTopic = 'test-topic';
        expect.assertions(5);
        instance.once(testTopic, testOnCallback);
        try {
            instance.once(testTopic, testOnCallback1);
        } catch (error: any) {
            expect(error.message).toEqual('you can not listen a topic twice!');
        }
        expect(instance.onceMessageCallbackMap.size).toEqual(1);
        expect(instance.onceMessageCallbackMap.get(testTopic)).toEqual(testOnCallback);
        try {
            instance.on(testTopic, testOnCallback1);
        } catch (error: any) {
            expect(error.message).toEqual('you can not listen a topic twice!');
        }
        expect(instance.messageCallbackMap.size).toEqual(0);
    });

    test('check removeListener', () => {
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testTopic = 'test-topic';
        instance.once(testTopic, testOnCallback);
        expect(instance.onceMessageCallbackMap.size).toEqual(1);
        expect(instance.onceMessageCallbackMap.get(testTopic)).toEqual(testOnCallback);
        instance.removeListener(testTopic);
        expect(instance.onceMessageCallbackMap.size).toEqual(0);

        instance.on(testTopic, testOnCallback);
        expect(instance.messageCallbackMap.size).toEqual(1);
        expect(instance.messageCallbackMap.get(testTopic)).toEqual(testOnCallback);
        instance.removeListener(testTopic);
        expect(instance.messageCallbackMap.size).toEqual(0);
    });

    test('check removeAllListener', () => {
        const exeName = 'test-exe-name';
        const instance = new IpcNode();
        const testOnCallback = (sender: IpcSender, message): void => { console.log(message); };
        const testOnCallback1 = (sender: IpcSender, message): void => { console.log(message); };
        const testTopic = 'test-topic';
        const testTopic1 = 'test-topic1';

        instance.once(testTopic, testOnCallback);
        instance.on(testTopic1, testOnCallback1);
        instance.removeAllListener();
        expect(instance.messageCallbackMap.size).toEqual(0);
        expect(instance.onceMessageCallbackMap.size).toEqual(0);
    });

    test('check send', () => {
        const instance = new IpcNode();
        const TopicMessage = { k1: 'v1' };
        const testTopic = 'test_topic';
        const expectMessage = {
            __type: 'yzb_ipc_renderer_message',
            topic: testTopic,
            message: TopicMessage,
        };
        expect.assertions(1);
        (instance.send(testTopic, TopicMessage) as any).then((message) => {
            expect(message).toEqual(expectMessage);
        });
    });

    test('check on message', () => {
        const identity = '123456';
        const instance = new IpcNode();
        const testTopic = 'test-topic';
        const testTopicMessage = { k1: 'v1' };
        const messageData = { topic: testTopic, message: testTopicMessage };
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
        };
        expect.assertions(3);
        instance.on(testTopic, (sender, message) => {
            expect(sender.identity).toEqual(identity);
            expect(message).toEqual(messageData.message);
        });
        (process as any).messageCallback(expectMessage);
        expect(instance.messageCallbackMap.size).toEqual(1);
    });

    test('check on message once', () => {
        const identity = '123456';
        const instance = new IpcNode();
        const testTopic = 'test-topic';
        const testTopicMessage = { k1: 'v1' };
        const messageData = { topic: testTopic, message: testTopicMessage };
        const expectMessage = {
            __type: 'yzb_ipc_node_message',
            identity,
            data: messageData,
        };
        expect.assertions(3);
        instance.once(testTopic, (sender, message) => {
            expect(sender.identity).toEqual(identity);
            expect(message).toEqual(messageData.message);
        });
        (process as any).messageCallback(expectMessage);
        expect(instance.onceMessageCallbackMap.size).toEqual(0);
    });
});
