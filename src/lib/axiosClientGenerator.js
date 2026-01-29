import axios from "axios";

export const createApiClient = (baseUrl,headerKeyName) => {
  const featureApiKeyValue = process.env?.[headerKeyName] || '';
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'x-api-key': featureApiKeyValue,
      'Content-Type': 'application/json'
    }
  })

  return client;
}