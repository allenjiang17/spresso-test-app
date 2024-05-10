
import {PixelEventsCheckoutCompleted, register} from "@shopify/web-pixels-extension";
import { getGeneralProperties, getEventProperties, isValidLineItem} from "./helper";
import { Event, OrderEvent, PurchaseEvent, ATCEvent} from "./types"

register(({ settings, analytics, browser }) => {

    
    analytics.subscribe('checkout_completed', async (event) => {

        console.log('Checkout Completed', event);

        // 1. Map to internal create order event
        const checkout = event.data.checkout;

        let deductions = [] as Array<{type: string, value: number}>
        checkout.discountApplications.forEach((discount)=>{
          if (discount.value?.amount) {
            deductions.push({type: discount.type as string, value: discount.value.amount as number})
          }
        })

        const generalProperties = getGeneralProperties();
        const eventProperties = await getEventProperties(browser);

        const createOrderEventData: Event<OrderEvent> = {
          event: 'spresso_create_order',
          ...generalProperties,
          properties: {
            ...eventProperties,
            orderNumber: checkout?.order?.id,
            totalOrderPrice: checkout?.totalPrice?.amount,
            totalVariantQuantity: String(checkout?.lineItems.length),
            totalVariantPrice: checkout?.subtotalPrice?.amount || null, //subtotal is the sum of the variant prices without tax, shipping, etc
            orderTax: checkout?.totalTax?.amount,
            totalOrderFees: checkout?.shippingLine?.price.amount,
            totalOrderDeductions: deductions.reduce(
              (acc: number, deduction: any) => acc + deduction.value,
              0,
            ),
            orderDeductions: deductions
          },
        };

        // 2. Map each line ite to a purchase variant event
        const purchaseVariantData: Event<PurchaseEvent>[] = checkout.lineItems
          .filter((lineItem) => isValidLineItem(lineItem))
          .map((lineItem) => ({
            event: 'spresso_purchase_variant',
            ...generalProperties,
            properties: {
              ...eventProperties,
              orderNumber: checkout.order?.id,
              variantSku: lineItem.variant?.sku || lineItem.variant?.id || lineItem.id,
              variantName: `${lineItem.variant?.title}|${lineItem.title}`|| lineItem.title || "",
              variantTotalPrice: (lineItem.variant?.price?.amount || 0) * (lineItem.quantity || 1),
              variantPrice: lineItem.variant?.price?.amount,
              variantStandardPrice: lineItem.variant?.price?.amount,
              variantQuantity: lineItem.quantity || 1,
            },
          }));

        // 3. Submit all events
        const events: Event<any>[] = Array.from(purchaseVariantData);
        events.push(createOrderEventData);

        submitEvents(settings.endpoint, settings.orgId, events);
    });


    analytics.subscribe('product_added_to_cart', async (event) => {

        console.log('Product Added To Cart', event);

        const events: Event<ATCEvent>[] = [];

        const cartLine = event.data.cartLine;
        if (!cartLine) {
          return
        }

        const generalProperties = getGeneralProperties();
        const eventProperties = await getEventProperties(browser);

        events.push({
          event: 'spresso_tap_add_to_cart',
          ...generalProperties,
          properties: {
            ...eventProperties,
            productId: cartLine.merchandise?.id,
            variantSku: cartLine.merchandise?.sku || cartLine.merchandise?.id,
            variantName: cartLine.merchandise?.title || cartLine.merchandise?.id,
            queryParameters: "", //shopify gives no access to URL
            variantQuantity: cartLine.quantity,
          },
        })

        submitEvents(settings.endpoint, settings.orgId, events);
    });

});

function submitEvents(endpoint : string, orgId : string, events: Event<any>[]): void {
  try {
    const body = JSON.stringify({ datas: events });

    window
      .fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=utf-8',
          'Org-Id': orgId,
        },
        body,
      })
      .then((res: { status: number }) => {
        if (res.status >= 400) {
          console.log(`Event Helper: Non-200 response from server: ${res.status}`);
        }
      });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.log(`Event Helper: Exception while sending event: ${msg}`);
  }
}
