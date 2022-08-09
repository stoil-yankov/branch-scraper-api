import axios from "axios";
import { SerpApiService } from "../application/SerpApiService"

describe('Serp API Intergration Test', () => {
    let api: SerpApiService;
    beforeAll(() => {
        const client = axios.create();
        api = new SerpApiService(client);
        
    })
    test('should return empty values', async () => {
        const branch = 	{
            "id" : 889399,
            "name" : "Baden Baden Downtown Office",
            "address" : "Maximilianstrasse 54 - 56",
            "zipcode" : "76534",
            "city" : "Baden Baden",
            "country_code" : "DE",
            "coordinates" : "POINT (8.254547 48.749794)",
            "supplier_name" : "Avis",
            "supplier_id" : 1
        };

        const result = await api.getAddressByCoordinatesValueSerpAPI(branch);

        expect(result).toBeTruthy();
    })})