export type Airport = {
    iata: string;
    name: string;
    coordinates: {
        lat: number;
        long: number;
    };
}