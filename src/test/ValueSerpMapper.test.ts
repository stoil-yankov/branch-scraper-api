import { ValueSerpMapper } from "../domain/mappers/ValueSerpMapper";

describe('Value SERP Mapper TEst', () => {
    test('should calculate coordinates successfully', () => {
        const c1 = "42.190460, 24.250882";
        const c2 = "42.194094, 24.325335";

        const result = ValueSerpMapper.checkCoordinatesDistance(c1, c2);

        expect(true);
    })

    test('should extract address information properly', () => {
        const addressInfo = "Buchbinder rent-a-car, Mettener Str. 21, 94469 Deggendorf, Deutschland";
        const supplierName = "Global Rent-a-Car";
        
        const result = ValueSerpMapper.mapAddressDetails(addressInfo, supplierName);
        expect(result[0]).toBe('Mettener Str. 21');
        expect(result[1]).toBe('94469');
    })
})