import { } from 'jest';
import { IpcSender, IpcNode } from '../src/index';

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
});

describe('IpcNode check', () => { });
