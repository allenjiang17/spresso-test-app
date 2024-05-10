/**From Spresso Web SDK */

export type GeneralProps = {
    uid: string;
    utcTimestampMs: number;
    timezoneOffset: number;
  };
  
  export type EventProps = {
    deviceId: string;
    userId: string;
    isLoggedIn: boolean;
    page: string;
    platform: string;
    userAgent: string;
    version: string;
  };
  
  export type Event<T> = GeneralProps & {
    event: string;
    properties: EventProps & T;
  };
  
  // **** Start Event definitions ****
  export type OrderEvent = {
    orderNumber?: string;
    totalOrderPrice?: number;
    totalVariantQuantity?: string;
    totalVariantPrice?: number | null;
    orderTax?: number | null;
    totalOrderFees?: number | null;
    totalOrderDeductions?: number;
    orderDeductions?: Array<{ type: string; value: number }>;
  };
  
  export type PurchaseEvent = {
    orderNumber?: string;
    variantSku?: string;
    variantTotalPrice?: number;
    variantQuantity?: number;
    variantName?: string;
    variantPrice?: number;
    variantStandardPrice?: number | null;
  };
  
  export type PricingEvent = {
    variantSku: string;
    variantPrice: number;
    queryParameters: string;
    inStock?: boolean;
  };
  
  export type PageViewEvent = {
    utmMedium?: string;
    utmSource?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmTarget?: string;
    utmPurpose?: string;
    utmAdId?: string;
    utmExperiment?: string;
    referrerUrl?: string;
    queryParameters?: string;
  };
  
  export type ATCEvent = {
    variantSku: string;
    variantName?: string;
    productId: string;
    queryParameters: string;
    variantQuantity: number;
  };
  // **** End Event definitions ****
  
  // **** Start input type definitions ****
  export type CartLineItem = {
    productId: string;
    variantId: string;
    sku?: string;
    name?: string;
    quantity?: number;
  };
  
  export type Deduction = {
    type?: string; // Store Credit, Gift Card, Coupon, Promo etc
    amount: number;
  };
  
  export type OrderLineItem = {
    productId: string;
    variantId?: string;
    sku?: string;
    name?: string;
    quantity?: number;
    basePrice?: number;
    price: number;
  };
  
  export type OrderDetails = {
    orderId: string;
    subtotalExcludingTax?: number;
    fees?: number; // Shipping & Handling, Customization etc
    tax?: number;
    deductions?: Deduction[];
    totalIncludingTax: number;
    lineItems: OrderLineItem[];
  };
  // **** End input type definitions ****