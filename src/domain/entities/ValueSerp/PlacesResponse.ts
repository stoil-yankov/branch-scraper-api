export interface PlacesResponse {
    request_info:       any;
    search_metadata:    any;
    search_parameters:  any;
    search_information: any;
    places_results:     PlacesResult[];
    pagination:         any;
}   

export interface PlacesResult {
    title:             string;
    data_cid:          string;
    price:             string;
    price_parsed:      number;
    price_description: string;
    data_id:           string;
    snippet?:          string;
    gps_coordinates:   GpsCoordinates;
    sponsored:         boolean;
    extensions:        string[];
    rating:            number;
    reviews:           number;
    position:          number;
    address?:          string;
}

export interface GpsCoordinates {
    latitude:  number;
    longitude: number;
}