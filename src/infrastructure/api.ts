import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from "axios";

export class BaseApi {
    constructor(private readonly client: AxiosInstance) { }

    protected createRequest(url: string, method: Method, data?: object): AxiosRequestConfig {
        const request: AxiosRequestConfig = {
            url,
            method,
            data: data ?? {}
        };

        return request;
    }

    protected async performRequest(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
        console.log(
            {
                url: requestConfig.url,
                headers: requestConfig.headers,
                body: requestConfig.data
            }
        );

        try {
            const response = await this.client.request(requestConfig);

            console.log(
                {
                    url: requestConfig.url,
                    headers: requestConfig.headers,
                    body: requestConfig.data
                });

            return response;
        } catch (error) {
            console.log(
                {
                    url: requestConfig.url,
                    headers: requestConfig.headers,
                    error: error
                });
            throw error;
        }
    }
}