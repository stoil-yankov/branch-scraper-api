import { AxiosRequestConfig } from "axios";
import { Airport } from "../entities/Airport";
import { Branch } from "../entities/Branch";
import { BranchDTO } from "../entities/BranchDTO";
import { Location } from "../entities/Location";

export class LocationsMapper {
    public static mapAirportRequest(value: string) {
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        url: `https://api.tomtom.com/search/2/poiSearch/${value}.json`,
        params: {
          key: process.env.TOMTOM_API_KEY,
          categorySet: '7383'
        }
      };

      return requestConfig;
    }

    public static mapAddressByCoordinatesRequest(value: string) {
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        url: `https://api.tomtom.com/search/2/reverseGeocode/${value}.json`,
        params: {
          key: process.env.SERP_API_KEY
        }
      };

      return requestConfig;
    }
    
    public static mapLocations(result: any): Location[] {
    let names: Location[] = [];
      for (let obj of result.geonames) {
        const entry: Location = {
          toponymName: obj.toponymName,
          name: obj.name,
          country: obj.countryName,
          lat: obj.lat,
          long: obj.lng
        };
        names.push(entry);
      }

      return names;
    }

    public static mapAirport(iata: string, poi: any): Airport { 
      const airport = (poi.results as Array<any>).find(x => x.poi.categories[0] = 'airport');
      // const poiResult = JSON.parse(poi.data);
      return {
          iata: iata,
          name: airport.poi.name,
          coordinates: {
            lat: airport.position.lat,
            long: airport.position.lon
          }
        }
    }

    public static mapCoordinatesForRequest(branchCoordinates: string): string {
      const coordinates = branchCoordinates.match(/\((.*?)\)/);
      if(!coordinates) return '';

      const regexResult = coordinates[1].split(' ');
      const lon = regexResult[0];
      const lat = regexResult[1];
      const result = `${lat}, ${lon}`;
      
      return result;
    }

    public static mapNewCityBranchTomTom(oldBranch: Branch, newBranch: any): BranchDTO {
      const apiAddress = newBranch.addresses[0].address;
      const position = newBranch.addresses[0].position;

      const coordinates = LocationsMapper.mapCoordinatesForRequest(oldBranch.coordinates);
      return {
        id: oldBranch.id,
        name: oldBranch.name,
        country:  oldBranch.country_name || oldBranch.country_code,
        address: oldBranch.address || 'N/A',
        newAddress: apiAddress.streetNameAndNumber || apiAddress.streetName,
        freeFormAddress: apiAddress.freeformAddress,
        zipCode: oldBranch.zipcode || 'N/A',
        newZipCode: apiAddress.postalCode,
        coordinates: coordinates,
        newCoordinates: position
      }
    }

    public static mapNewCityBranchValueSerp(oldBranch: Branch, newBranch: any): BranchDTO {
      const apiAddress = newBranch.addresses[0].address;
      const position = newBranch.addresses[0].position;

      const coordinates = LocationsMapper.mapCoordinatesForRequest(oldBranch.coordinates);
      return {
        id: oldBranch.id,
        name: oldBranch.name,
        country:  oldBranch.country_name || oldBranch.country_code,
        address: oldBranch.address || 'N/A',
        newAddress: apiAddress.streetNameAndNumber || apiAddress.streetName,
        freeFormAddress: apiAddress.freeformAddress,
        zipCode: oldBranch.zipcode || 'N/A',
        newZipCode: apiAddress.postalCode,
        coordinates: coordinates,
        newCoordinates: position
      }
    }
}