import { } from 'jest';
import { IpcSender, IpcNode } from '../src/index';

(global as any).process = {
    send: (message: any) => {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    },
    on: (topic: string, callback: (message: any) => void) => { }
};

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
});
