import { AxiosInstance } from './axios-helper'

export interface Address {
  id: number
  customer_id: number
  first_name: string
  last_name: string
  company: string
  address1: string
  address2: string
  city: string
  province: string
  country: string
  zip: string
  phone: string
  name: string
  province_code: string
  country_code: string
  country_name: string
  default: boolean
}

export interface Customer {
  id: number
  email: string
  accepts_marketing: boolean
  created_at: Date
  updated_at: Date
  first_name: string
  last_name: string
  orders_count: number
  state: string
  total_spent: string
  last_order_id: number
  note: string
  verified_email: true
  multipass_identifier: any
  tax_exempt: boolean
  phone: string
  tags: string
  last_order_name: string
  currency: string
  addresses: Address[]
  accepts_marketing_updated_at: Date
  marketing_opt_in_level: string
  tax_exemptions: any[]
  admin_graphql_api_id: string
  default_address: Address
}

export interface Variant {
  id: number
  product_id: number
  title: string
  price: string
  sku: string
  position: number
  inventory_policy: string
  compare_at_price: string
  fulfillment_service: string
  inventory_management: any
  option1: string
  option2: any
  option3: any
  created_at: Date
  updated_at: Date
  taxable: boolean
  barcode: string
  grams: number
  image_id: number
  weight: number
  weight_unit: string
  inventory_item_id: number
  inventory_quantity: number
  old_inventory_quantity: number
  requires_shipping: boolean
  admin_graphql_api_id: string
}

export interface ProductImage {
  id: number
  product_id: number
  position: number
  created_at: Date
  updated_at: Date
  alt: any
  width: number
  height: number
  src: string
  variant_ids: any[]
  admin_graphql_api_id: string
}

export interface ProductOption {
  id: number
  product_id: number
  name: string
  position: number
  values: any[]
}
export interface Product {
  id: number
  title: string
  body_html: string
  vendor: string
  product_type: string
  created_at: Date
  handle: string
  updated_at: Date
  published_at: Date
  template_suffix: string
  status: string
  published_scope: string
  tags: string
  admin_graphql_api_id: string
  variants: Variant[]
  options: ProductOption[]
  images: ProductImage[]
  image: ProductImage
}

export class ShopifyAPI {
  private instance

  constructor() {
    this.instance = AxiosInstance
  }

  public async getCustomer(id: number): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/customers/${id}.json`
      }
      const response = await this.instance(requestOptions)
      return response.data.customer
    } catch (error) {
      console.error(error)
    }
  }

  public async updateCustomer(id: number, customer: Customer): Promise<any> {
    try {
      const requestOptions = {
        method: 'put',
        url: `/customers/${id}.json`,
        data: { customer }
      }
      const response = await this.instance(requestOptions)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  public async getProduct(id: number): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/products/${id}.json`
      }
      const response = await this.instance(requestOptions)
      console.log(response.data.product)
      return response.data.product
    } catch (error) {
      console.error(error)
    }
  }

  public async getProducts(): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/products.json`
      }
      const response = await this.instance(requestOptions)
      return response.data.products
    } catch (error) {
      console.error(error)
    }
  }

  public async getProductsByCollectionId(collectionId): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/products.json?collection_id=${collectionId}&limit=250`
      }
      const response = await this.instance(requestOptions)
      return response.data.products
    } catch (error) {
      console.error(error)
    }
  }

  public async updateProduct(product: Product): Promise<any> {
    try {
      const requestOptions = {
        method: 'put',
        url: `/products/${product.id}.json`,
        data: { product }
      }
      const response = await this.instance(requestOptions)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  public async getOrders(customerId: number): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `customers/${customerId}/orders.json?status=any`
      }
      const response = await this.instance(requestOptions)
      return response.data.orders
    } catch (error) {
      console.error(error)
    }
  }
  public async getProductMetafields(productId): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/products/${productId}/metafields.json`
      }
      const response = await this.instance(requestOptions)
      return response.data.metafields
    } catch (error) {
      console.error(error)
    }
  }
  public async getDiscountCode(): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/discount_codes/lookup.json?code=DETMEMBERSHIP`
      }
      const response = await this.instance(requestOptions)
      return response.data.discount_code
    } catch (error) {
      console.error(error)
    }
  }
  public async getPriceRule(priceRuleId): Promise<any> {
    try {
      const requestOptions = {
        method: 'get',
        url: `/price_rules/${priceRuleId}.json`
      }
      const response = await this.instance(requestOptions)
      return response.data.price_rule
    } catch (error) {
      console.error(error)
    }
  }
  public async updatePriceRule(
    priceRuleId,
    availableMonthlyCredit
  ): Promise<any> {
    try {
      const requestOptions = {
        method: 'put',
        url: `/price_rules/${priceRuleId}.json`,
        data: {
          price_rule: {
            value: availableMonthlyCredit
          }
        }
      }
      const response = await this.instance(requestOptions)
      return response.data.price_rule
    } catch (error) {
      console.error(error)
    }
  }
}
