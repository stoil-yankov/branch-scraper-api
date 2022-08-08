import { AxiosInstance, AxiosRequestConfig } from "axios";
import { LocationsMapper } from "../domain/mappers/LocationsMapper";
import * as iatas from '../../resources/unique_iatas.json';
import * as city_branches from "../../resources/city_branches.json";
import { Airport } from "../domain/entities/Airport";
import { BranchDTO } from "../domain/entities/BranchDTO";
import { ValueSerpMapper } from "../domain/mappers/ValueSerpMapper";
import { PlaceDTO } from "../domain/entities/ValueSerp/PlaceDTO";
import { PlacesResponse } from "../domain/entities/ValueSerp/PlacesResponse";
import { LogService } from "./FileService";
const fs = require('fs');
var csvWriter = require('csv-write-stream')


export class ApiService {

    constructor(private readonly client: AxiosInstance) { }

    async getIatasWithCoordinates(): Promise<Array<string>> {
        const result = new Array<string>();
        var writer = csvWriter();

        const finalPathFile = '/Users/stoil.yankov/Repos/tomtomapi-v1/data.csv';
        if (!fs.existsSync(finalPathFile))
            writer = csvWriter({ headers: ["NAME", "IATA", "LAT", "LONG"] });
        else
            writer = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream(finalPathFile, { flags: 'a' }));

        for (const iata of iatas.iatas) {
            if (iata.iata) {
                const resultAirport = await this.getAirportByIATA(iata.iata);
                if (!resultAirport) {
                    result.push(`${iata.iata}, N/A, N/A`);
                    writer.write({
                        NAME: 'N/A',
                        IATA: iata.iata,
                        LAT: 'N/A',
                        LONG: 'N/A'
                    });
                    continue;
                }

                writer.write({
                    NAME: resultAirport.name,
                    IATA: resultAirport.iata,
                    LAT: resultAirport.coordinates.lat,
                    LONG: resultAirport.coordinates.long
                });
                result.push(`${resultAirport.name}, ${iata.iata}, ${resultAirport.coordinates.lat}, ${resultAirport.coordinates.long}`);
                console.log(`${resultAirport.name}, ${iata.iata}, ${resultAirport.coordinates.lat}, ${resultAirport.coordinates.long}`);
            }
        }
        writer.end();
        return result;
    }

    async getLocationByCoordinates(): Promise<Array<BranchDTO>> {
        const result = new Array<BranchDTO>();
        var writer = csvWriter();

        const finalPathFile = '/Users/stoil.yankov/Repos/tomtomapi-v1/data_cities.csv';
        if (!fs.existsSync(finalPathFile))
            writer = csvWriter({ headers: ["NAME", "ADDRESS", "NEW_ADDRESS", "FREE_FORM_ADDRESS", "ZIP_CODE", "NEW_ZIP_CODE", "COORDINATES", "NEW_COORDINATES"] });
        else
            writer = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream(finalPathFile, { flags: 'a' }));
        let count = 0;
        for (const branch of city_branches.city_branches) {
            if (count >= 500) break;
            count++;
            const resultBranchDTO = await this.getAddressByCoordinates(branch);
            if (!resultBranchDTO) {
                writer.write({
                    ID: branch.id,
                    ADDRESS: branch.address || '',
                    NEW_ADDRESS: 'N/A',
                    ZIP_CODE: branch.zipcode,
                    NEW_ZIP_CODE: 'N/A',
                    COORDINATES: branch.coordinates
                });
                continue;
            }
            writer.write({
                ID: resultBranchDTO.id,
                ADDRESS: resultBranchDTO.address,
                NEW_ADDRESS: resultBranchDTO.newAddress,
                FREE_FORM_ADDRESS: resultBranchDTO.freeFormAddress,
                ZIP_CODE: resultBranchDTO.zipCode,
                NEW_ZIP_CODE: resultBranchDTO.newZipCode,
                COORDINATES: resultBranchDTO.coordinates,
                NEW_COORDINATES: resultBranchDTO.newCoordinates
            });
            result.push(resultBranchDTO);
            console.log(JSON.stringify(resultBranchDTO));
        }
        writer.end();
        return result;
    }

    async getAirportByIATA(value: string): Promise<Airport | null> {
        try {
            const requestConfig: AxiosRequestConfig = LocationsMapper.mapAirportRequest(value);

            const response = await this.client.request<string>(requestConfig);

            // console.log(`Successfuly retrieved airport details for ${value}: `, response.data);

            const mappedResponse = LocationsMapper.mapAirport(value, response.data);

            // console.log(`Successfuly mapped airport details for ${value}: `, mappedResponse);

            return mappedResponse;
        } catch (error: any) {
            console.log(`Error getting IATA information for ${value}`, error);
            return null;
        }
    }

    async getAddressByCoordinates(branch: any): Promise<BranchDTO | null> {
        try {
            const requestParam = LocationsMapper.mapCoordinatesForRequest(branch.coordinates);

            const requestConfig: AxiosRequestConfig = LocationsMapper.mapAddressByCoordinatesRequest(requestParam);

            const response = await this.client.request<string>(requestConfig);

            const mappedResponse = LocationsMapper.mapNewCityBranchTomTom(branch, response.data);

            return mappedResponse;
        } catch (error: any) {
            console.log(`Error getting Address information for ${branch.id}`, error);
            return null;
        }
    }

    async getAddressByCoordinatesValueSerpAPI(branch: any): Promise<PlaceDTO | null> {
        try {
            // 1. Create request
            const requestConfig = ValueSerpMapper.mapPlacesRequest(branch);

            // 2. Call API with request
            const response = await this.client.request<string>(requestConfig);

            // 3. Log the response in a file
            LogService.logJsonResponseInFile(response, '/Users/stoil.yankov/Repos/tomtomapi-v1/places.csv', requestConfig.params);

            // 4. Map the response
            const mappedResponse = ValueSerpMapper.mapPlacesResponse(branch, JSON.parse(response.data) as PlacesResponse);

            // 5. Return 
            return mappedResponse;
        } catch (error: any) {
            console.log(`Error getting Place from SerpAPI for ${branch.id}`, error);
            return null;
        }
    }
}