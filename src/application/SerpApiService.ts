import { AxiosInstance } from "axios";
import { PlaceDTO } from "../domain/entities/ValueSerp/PlaceDTO";
import { ValueSerpMapper } from "../domain/mappers/ValueSerpMapper";
import { LogService } from "./FileService";

import * as branches from "../../resources/de_city_branches.json";

const fs = require('fs');
const { stringify } = require("csv-stringify");

const CSV_HEADERS = ["ID", "NAME", "GOOGLE_NAME", "ADDRESS", "ZIP_CODE", "GOOGLE_ADDRESS_AND_ZIP", "SUPPLIER", "COORDINATES", "GOOGLE_COORDINATES", "SUPPLIER_ID"];

export class SerpApiService {
    constructor(private readonly client: AxiosInstance) { }

    async getAddresses(offset: number, limit: number): Promise<any> {
        const results = new Array<PlaceDTO>();
        const duplicateNames: Array<string> = [];
        const branchesArray = branches.branches.slice(offset, limit);
        
        const date = new Date();
        const logFileName = `logs/response_logs_${date.toISOString()}.json`;
        const filename = `results/results_${date.toISOString()}.csv`;
        
        const writableStream = fs.createWriteStream(filename,  { flags: 'a' });
        const stringifier = stringify({ header: true, columns: CSV_HEADERS });
        stringifier.pipe(writableStream);

        let countNoRelevantResults = 0;
        let countSkippedBranches = 0;
        let count = 0;

        for (const branch of branchesArray) {
            count++;
            
            // Check if an API request for this branch and supplier has been made already
            const branchNameAndSupplier = branch.name + ' ' + branch.supplier_name;
            if (duplicateNames.includes(branchNameAndSupplier)) {
                countSkippedBranches++;
                continue;
            }
            duplicateNames.push(branchNameAndSupplier);

            // Get result from API
            const result = await this.getAddressByCoordinatesValueSerpAPI(branch, logFileName);

            // Мap to CSV and write in the pipe
            const csvResult = ValueSerpMapper.mapToCsv(branch, result);
            stringifier.write(csvResult);

            if (!result) {
                countNoRelevantResults++;
                continue;
            }

            console.log(`Successfully added ${result.id}, count: ${count}, unmappedCount: ${countNoRelevantResults}, skipped: ${countSkippedBranches}`)

            results.push(result);
        }
        console.log('No relevant results count:' + countNoRelevantResults);
        return results;
    }

    async getAddressByCoordinatesValueSerpAPI(branch: any, logFileName: string): Promise<PlaceDTO | null> {
        try {
            // 1. Create request
            const requestConfig = ValueSerpMapper.mapPlacesRequest(branch);

            // 2. Call API with request
            const response = await this.client.request<string>(requestConfig);

            // 3. Log the response in a file
            LogService.logJsonResponseInFile(response.data, logFileName, requestConfig.params);

            // 4. Map the response
            const mappedResponse = ValueSerpMapper.mapPlacesResponse(branch, response.data as any);

            // 5. Return 
            return mappedResponse;
        } catch (error: any) {
            console.error(`Error getting Place from SerpAPI for ${branch.id}`, error.message);
            return null;
        }
    }
}