import { ProcessMessage } from '../src';

test('ProcessMessage', () => {
    const tmpPath = '/root/repos/github/yzb-extension-mqtt/.tmp';
    const processMessage = new ProcessMessage(tmpPath);
    processMessage.limitSize = 8;
    const message = '1234567';
    const processedMessage = processMessage.encodeMessage(message);
    expect(processedMessage).toEqual(message);
    expect(processMessage.decodeMessage(processedMessage)).toEqual(message);

    const message1 = '12345678';
    const processedMessage1 = processMessage.encodeMessage(message1);
    expect(processedMessage1.__yzb_process_message_type).toEqual('file');
    expect(processedMessage1.__yzb_process_message_content_type).toEqual('string');
    expect(processMessage.decodeMessage(processedMessage1)).toEqual(message1);

    const message2 = ['12'];
    const processedMessage2 = processMessage.encodeMessage(message2);
    expect(processedMessage2).toEqual(message2);
    expect(processMessage.decodeMessage(processedMessage2)).toEqual(message2);


    const message3 = ['12345678'];
    const processedMessage3 = processMessage.encodeMessage(message3);
    expect(processedMessage3.__yzb_process_message_type).toEqual('file');
    expect(processedMessage3.__yzb_process_message_content_type).toEqual('object');
    expect(processMessage.decodeMessage(processedMessage3)).toEqual(message3);

    const processedMessage4 = processMessage.encodeMessage(null);
    expect(processMessage.decodeMessage(processedMessage4)).toEqual(null);

    const processedMessage5 = processMessage.encodeMessage(undefined);
    expect(processedMessage5).toEqual(null);
});