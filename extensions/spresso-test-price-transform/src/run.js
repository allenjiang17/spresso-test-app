// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
let RETURN_OBJECT = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  //only apply to cart lines with type ProductVariant (not custom products)
  //in the future, can include an extra LIP that specifies which products should be included in the dynamic price adjustment
  const cartLines = input.cart.lines.filter(line => line.merchandise.__typename == "ProductVariant");

  for (let line of cartLines) {
    
    //if (JSON.stringify(line.merchandise.spressoCostList.value).includes(line.spressoPrice.value)) {

    const spressoPrice = parseFloat(line.spressoPrice.value);

      if (line.spressoPrice.value && Number.isFinite(spressoPrice)) {
        //create new Cart Operation Object
        let newCartOperationObj = {};
        newCartOperationObj.update = {
          "cartLineId": line.id, 
          "price": {
            "adjustment": {
              "fixedPricePerUnit": {
                "amount": spressoPrice
              }
            }
          }
        }

        RETURN_OBJECT.operations.push(newCartOperationObj);
      }
      
    }

  //}

  return RETURN_OBJECT;
};