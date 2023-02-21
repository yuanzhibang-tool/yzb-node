import { randomUUID } from 'crypto';
const path = require('path');
const fs = require('fs');

export class ProcessMessage {
    tmpFileDir: string;
    limitSize = 8 * 1024;
    constructor(tmpFileDir?) {
        if (tmpFileDir) {
            this.tmpFileDir = tmpFileDir;
        } else {
            this.tmpFileDir = process.env.PROCESS_MESSAGE_TMP_DIR as any;
        }
        if (!this.tmpFileDir) {
            throw new Error("the process.env.PROCESS_MESSAGE_TMP_DIR must be set");

        }
        if (!fs.existsSync(this.tmpFileDir)) {
            fs.mkdirSync(this.tmpFileDir, { recursive: true });
        }
    }
    encodeMessage(oriMessage: any) {
        if (typeof oriMessage === 'string') {
            const bytes = Buffer.byteLength(oriMessage, "utf-8");
            if (bytes >= this.limitSize) {
                // write to file as message
                const tmpFilePath = this.writeMessageFile(oriMessage);
                return {
                    __yzb_process_message_type: 'file',
                    __yzb_process_message_content_type: 'string',
                    __yzb_process_message_content: tmpFilePath
                };
            } else {
                return oriMessage;
            }
        } else {
            try {
                const messageString = JSON.stringify(oriMessage);
                const bytes = Buffer.byteLength(messageString, "utf-8");
                if (bytes >= this.limitSize) {
                    // write to file as message
                    const tmpFilePath = this.writeMessageFile(messageString);
                    return {
                        __yzb_process_message_type: 'file',
                        __yzb_process_message_content_type: 'object',
                        __yzb_process_message_content: tmpFilePath
                    };
                } else {
                    return oriMessage;
                }
            } catch (error) {
                return null;
            }
        }
    }

    decodeMessage(oriMessage: any) {
        if (oriMessage === null || typeof oriMessage === 'undefined') {
            return oriMessage;
        }
        if (oriMessage.__yzb_process_message_type === 'file') {
            const messageContentType = oriMessage.__yzb_process_message_content_type;
            const messagePath = oriMessage.__yzb_process_message_content;
            const stringContent = fs.readFileSync(messagePath, {
                encoding: 'utf8',
            });
            fs.rm(messagePath, { recursive: true }, (err) => {
            });
            if (messageContentType === 'object') {
                return JSON.parse(stringContent);
            } else {
                return stringContent;
            }
        } else {
            return oriMessage;
        }
    }

    writeMessageFile(messageString: string) {
        const messageGuid = randomUUID();
        const tmpFilePath = path.join(this.tmpFileDir, messageGuid);
        fs.writeFileSync(tmpFilePath, messageString, {
            encoding: 'utf8',
            mode: 438,
            flag: 'w',
        });
        return tmpFilePath;
    }

}