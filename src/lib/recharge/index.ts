export interface RechargeCustomer {
  id: number
  analytics_data: any
  billing_address1: string
  billing_address2: any
  billing_city: string
  billing_company: string
  billing_country: string
  billing_phone: string
  billing_province: string
  billing_zip: string
  created_at: string
  email: string
  first_charge_processed_at: null
  first_name: string
  has_card_error_in_dunning: false
  has_valid_payment_method: false
  hash: string
  last_name: string
  number_active_subscriptions: number
  number_subscriptions: number
  processor_type: null
  reason_payment_method_not_valid: null
  shopify_customer_id: null
  status: string
  stripe_customer_token: string
  updated_at: string
}
