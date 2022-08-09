import { AxiosRequestConfig } from "axios";
import { Branch } from "../entities/Branch";
import { PlaceCSV } from "../entities/ValueSerp/PlaceCSV";
import { PlaceDTO } from "../entities/ValueSerp/PlaceDTO";
import { PlacesResponse, PlacesResult } from "../entities/ValueSerp/PlacesResponse";
const VALUE_SERP_KEY = '5B988E05529947B59C7001D55F5B63B7';

export class ValueSerpMapper {
    public static mapPlacesRequest(branch: Branch) {
        const query = `${branch.name} ${branch.supplier_name}`;
        const location = this.mapCoordinatesForRequest(branch.coordinates);

        const params = {
            api_key: VALUE_SERP_KEY,
            q: query,
            search_type: "places",
            location: location,
            hl: branch.country_code.toLowerCase()
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
        const result = this.mapBestMatch(response, branch);

        const coordinates = this.mapCoordinatesForResponse(branch.coordinates);
        const newCoordinates = `${result.gps_coordinates.latitude}, ${result.gps_coordinates.longitude}`;

        const coordinatesDistanceCheck = this.checkCoordinatesDistance(coordinates, newCoordinates);
        if (!coordinatesDistanceCheck) {
            throw new Error("Result distance is more than 100 meters");
        }

        const [address, zipcode, city, country] = this.mapAddressDetails(result.address || result.extensions[3], branch.supplier_name);

        return {
            id: branch.id,
            name: branch.name,
            newName: result.title,
            address: branch.address || 'N/A',
            zipCode: branch.zipcode || 'N/A',
            supplier: branch.supplier_name,
            newAddress: address,
            newZipCode: zipcode,
            newCity: city,
            newCountry: country,
            coordinates: coordinates,
            newCoordinates: newCoordinates,
            supplierId: branch.supplier_id
        }
    }

    public static mapBestMatch(response: PlacesResponse, branch: Branch): PlacesResult {
        const resultsSliced = response.places_results.slice(0, 10);
        const result = this.checkForBestProviderMatch(branch.supplier_name, resultsSliced);
        if (!result) {
            throw new Error('No relevant branch found');
        }

        return result;
    }

    public static checkForBestProviderMatch(supplierName: string, resultsSliced: PlacesResult[]): PlacesResult | undefined {
        supplierName = supplierName.toLowerCase();

        for (const result of resultsSliced) {
            const grp = this.getSupplierGroup(supplierName);
            if(grp){
                const isValid = this.isResultValid(grp, result);
                if (isValid) return result;
            }
        }
        return resultsSliced.find(x => x.title.toLowerCase().includes(supplierName));
    }

    public static getSupplierGroup(supplierName: string): string[] | undefined {
        const a1 = ["enterprise", "national", "alamo"];
        const a2 = ["avis", "budget"];
        const a3 = ["europcar", "keddy", "keddy by europcar"];
        const a4 = ["thrifty", "dollar"];
        const a5 = ["buchbinder", "global rent-a-car", "robben & wientjes"];
        const a6 = ["hertz", "firefly"];
        const a7 = ["goldcar", "interrent", "rhodium"];

        const suppliersArr = [a1, a2, a3, a4, a5, a6, a7];

        return suppliersArr.find(x => x.includes(supplierName));
    }

    public static isResultValid(supplierGrp: string[], result: PlacesResult): boolean {
        for (const supplier of supplierGrp) {
            if (result.title.toLowerCase().includes(supplier.toLowerCase())) {
                return true;
            }
        }
        return false;
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

    public static mapToCsv(branch: any, result: PlaceDTO | null): PlaceCSV | null {
        if (!result) {
            return null;
            // return {
            //     ID: branch.id,
            //     NAME: branch.name,
            //     GOOGLE_NAME: 'XXX',
            //     ADDRESS: branch.address,
            //     ZIP_CODE: branch.zipcode,
            //     NEW_ADDRESS: 'XXX',
            //     NEW_ZIP: 'XXX',
            //     NEW_CITY: 'XXX',
            //     NEW_COUNTRY: 'XXX',
            //     SUPPLIER: branch.supplier_name,
            //     COORDINATES: this.mapCoordinatesForResponse(branch.coordinates),
            //     GOOGLE_COORDINATES: 'XXX',
            //     SUPPLIER_ID: branch.supplier_id
            // }
        }

        return {
            ID: result.id.toString(),
            NAME: result.name,
            GOOGLE_NAME: result.newName,
            ADDRESS: result.address,
            ZIP_CODE: result.zipCode,
            NEW_ADDRESS: result.newAddress,
            NEW_ZIP: result.newZipCode,
            NEW_CITY: result.newCity,
            NEW_COUNTRY: result.newCountry,
            SUPPLIER: result.supplier,
            COORDINATES: result.coordinates,
            GOOGLE_COORDINATES: result.newCoordinates,
            SUPPLIER_ID: result.supplierId
        }
    }

    public static checkCoordinatesDistance(coordinates: string, newCoordinates: string, maxDistance = 100): boolean {
        let [lat1, lon1] = coordinates.split(",");
        let [lat2, lon2] = newCoordinates.split(",");

        var R = 6371; // km
        var dLat = this.toRad(+lat2 - +lat1);
        var dLon = this.toRad(+lon2 - +lon1);
        var _lat1 = this.toRad(+lat1);
        var _lat2 = this.toRad(+lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(_lat1) * Math.cos(_lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c * 1000; // to meters

        return d < maxDistance;
    }

    public static isSupplierIncludedInText(supplierName: string, text:string): boolean{
        const grp = this.getSupplierGroup(supplierName.toLowerCase());
        if(grp){
            const result = grp.find(x => text.toLowerCase().includes(x));
            if(result) return true;
        }
        return false;
    }


    public static mapAddressDetails(resAddress: string, supplierName: string): [string, string, string, string] {
        const splittedAddress = resAddress.split(",");
        let first = 0;
        const numElems = splittedAddress.length;
        let address: string;
        if (numElems > 3) {
            if (this.isSupplierIncludedInText(supplierName,splittedAddress[0])) {
                address = splittedAddress[first + 1].trim();
            } else {
                address = `${splittedAddress[first].trim()}, ${splittedAddress[first + 1].trim()}`;
            }
            first++;
        } else {
            address = splittedAddress[first].trim();
        }

        const zipCode = splittedAddress[first + 1].trim().split(" ")[0];
        const city = splittedAddress[first + 1].trim().split(" ").slice(1).join(' ');
        const country = splittedAddress[first + 2].trim();

        return [address, zipCode, city, country];
    }

    // Converts numeric degrees to radians
    private static toRad(value: number): number {
        return value * Math.PI / 180;
    }

}