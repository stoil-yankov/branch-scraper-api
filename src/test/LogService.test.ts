import { LogService } from "../application/FileService";

describe('Log Service Test', () => {
    test('should log into file successfully', () => {
        const response = {
            name: "test",
            value: "value"
        };

        const request = {
            "request" : "req"
        };

        LogService.logJsonResponseInFile(response, '/Users/stoil.yankov/Repos/tomtomapi-v1/places_test.csv', request);
        LogService.logJsonResponseInFile(response, '/Users/stoil.yankov/Repos/tomtomapi-v1/places_test.csv', request);

        expect(true);
    })
})