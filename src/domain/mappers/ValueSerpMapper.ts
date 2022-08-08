import { AxiosRequestConfig } from "axios";
import { Branch } from "../entities/Branch";
import { PlaceDTO } from "../entities/ValueSerp/PlaceDTO";
import { PlacesResponse, PlacesResult } from "../entities/ValueSerp/PlacesResponse";
const VALUE_SERP_KEY = '5B988E05529947B59C7001D55F5B63B7';

export class ValueSerpMapper {
    public static mapPlacesRequest(branch: Branch) {
        const query = `${branch.supplier_name}`;
        const location = this.mapCoordinatesForRequest(branch.coordinates);

        const params = {
            api_key: VALUE_SERP_KEY,
            q: query,
            search_type: "places",
            location: location
        }

        const requestConfig: AxiosRequestConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            url: `https://api.valueserp.com/search`,
            params: params
        };

        return requestConfig;
    }

    public static mapPlacesResponse(branch: Branch, response: PlacesResponse): PlaceDTO {
        const result = this.mapBestMatch(response, branch.supplier_name);
        const coordinates = this.mapCoordinatesForResponse(branch.coordinates);

        return {
            id: branch.id,
            name: branch.name,
            googleName: result.title,
            address: branch.address || 'N/A',
            zipCode: branch.zipcode || 'N/A',
            supplier: branch.supplier_name,
            googleAddress: result.address || result.extensions[3],
            coordinates: coordinates,
            googleCoordinates: `${result.gps_coordinates.latitude} ${result.gps_coordinates.longitude}`,
            supplierId: branch.supplier_id
        }
    }

    public static mapBestMatch(response: PlacesResponse, supplierName: string): PlacesResult {
        // const result = response.places_results.find(x => x.title.toLowerCase().includes(supplierName.toLowerCase()));
        const result = this.checkForBestProviderMatch(supplierName, response);
        if(!result) {
            throw new Error('No relevant branch found');
        }

        return result;
    }

    public static checkForBestProviderMatch(supplierName: string, response: PlacesResponse): PlacesResult | undefined{ 
        const a1 = ["enterprise", "national", "alamo"];
        const a2 = ["avis","budget"];
        const a3 = ["europcar","keddy", "keddy by europcar"];
        const a4 = ["thrifty","dollar"];
        const a5 = ["buchbinder","global rent-a-car"];
        const a6 = ["hertz","firefly"];
        const a7 = ["goldcar","interrent", "rhodium"];
        const resultsSliced = response.places_results.slice(0, 10);
        supplierName = supplierName.toLowerCase();

        for(const result of resultsSliced){
            if(a1.includes(supplierName)){
                for(const supplier of a1){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a2.includes(supplierName)){
                for(const supplier of a2){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a3.includes(supplierName)){
                for(const supplier of a3){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a4.includes(supplierName)){
                for(const supplier of a4){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a5.includes(supplierName)){
                for(const supplier of a5){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a6.includes(supplierName)){
                for(const supplier of a6){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            } else if(a7.includes(supplierName)){
                for(const supplier of a7){
                    if(result.title.toLowerCase().includes(supplier.toLowerCase())){
                        return result;
                    } 
                }
            }
        }
        return resultsSliced.find(x => x.title.toLowerCase().includes(supplierName));
    }

    public static mapCoordinatesForRequest(branchCoordinates: string): string {
        const coordinates = this.mapCoordinates(branchCoordinates);
        const result = `lat:${coordinates[1]}, lon:${coordinates[0]}, zoom:18`;

        return result;
    }

    public static mapCoordinatesForResponse(branchCoordinates: string): string {
        const coordinates = this.mapCoordinates(branchCoordinates);
        const result = `${coordinates[1]}, ${coordinates[0]}`;

        return result;
    }

    public static mapCoordinates(branchCoordinates: string): string[] {
        const coordinates = branchCoordinates.match(/\((.*?)\)/);
        if (!coordinates) return [];

        const regexResult = coordinates[1].split(' ');
        const lon = regexResult[0];
        const lat = regexResult[1];

        return [lon, lat];
    }

    public static mapToCsv(branch: any, result: PlaceDTO | null) {
        if (!result) {
            return {
                ID: branch.id,
                NAME: branch.name,
                GOOGLE_NAME: 'XXX',
                ADDRESS: branch.address,
                ZIP_CODE: branch.zipcode,
                GOOGLE_ADDRESS_AND_ZIP: 'XXX',
                SUPPLIER: branch.supplier_name,
                COORDINATES: this.mapCoordinatesForResponse(branch.coordinates),
                GOOGLE_COORDINATES: 'XXX',
                SUPPLIER_ID: branch.supplier_id
            }
        }

        return {
            ID: result.id,
            NAME: result.name,
            GOOGLE_NAME: result.googleName,
            ADDRESS: result.address,
            ZIP_CODE: result.zipCode,
            GOOGLE_ADDRESS_AND_ZIP: result.googleAddress,
            SUPPLIER: result.supplier,
            COORDINATES: result.coordinates,
            GOOGLE_COORDINATES: result.googleCoordinates,
            SUPPLIER_ID: result.supplierId
        }
    }
}