import axios from 'axios'

export const AxiosInstance = axios.create({
  baseURL: `${process.env.STORE_URL}/admin/api/2021-01`,
  headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_API_KEY }
})
