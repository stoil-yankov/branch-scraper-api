const fs = require("fs");
const stringify = require('json-stringify-safe');

export class LogService {
    public static logJsonResponseInFile(response: any, fileName: string, request?: any) {
        if (request) {
            const formattedReq = this.appendDivider(stringify(request, null, 4));
            fs.appendFile(fileName, formattedReq, function (err: any) {
                if (err) throw err;
            });
        }

        const formattedRes = this.appendDivider(stringify(response, null, 4));
        fs.appendFile(fileName, formattedRes , function (err: any) {
            if (err) throw err;
        });
    }

    private static appendDivider(data: any): string {
        return  '\n---------------------\n' + data + '\n---------------------\n';
    }
}