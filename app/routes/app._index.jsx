import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";


const SPRESSO_FUNCTION_NAME = "spresso-test-price-transform";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {

  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get('action');

  let returnObj;
  
  switch (actionType) {
    case 'createCartTransform':
      returnObj = await createCartTransform(admin);
      return json({actionType: "createCartTransform", data: returnObj})

    case 'generateAccessToken':
      returnObj = await generateAccessToken();
      return json({actionType: "generateAccessToken", data: returnObj})

    default:
      return json({ error: "Unknown action" }, { status: 400 });
  }


};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  let resultMessage;

  if (actionData?.actionType === "createCartTransform") {

    if (actionData?.data?.id) {
      resultMessage = actionData?.data?.id;
    } else {
      resultMessage = actionData?.data?.errors[0].message ?? "an error occurred";
    }

  } else if (actionData?.actionType === "generateAccessToken") {


  }

  useEffect(() => {
    if (resultMessage) {
      shopify.toast.show(resultMessage);

    }
  }, [resultMessage]);

  const createCartTransform = () => submit({ action: 'createCartTransform' }, { replace: true, method: "POST" });

  return (
    <Page>
      <ui-title-bar title="Spresso Price Optimization App">
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Install the cart transform function by clicking the button below.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Note: This will require a Shopify Plus account.
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={createCartTransform}>
                    Create Cart Transform Function
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}


async function createCartTransform(admin) {
  
  const funcQueryResponse = await admin.graphql(
    `query {
      shopifyFunctions(first: 25) {
        nodes {
          app {
            title
          }
          apiType
          title
          id
        }
      }
    }`);
  const funcQueryResponseJSON = await funcQueryResponse.json();

  const shopifyFunctions = funcQueryResponseJSON.data.shopifyFunctions.nodes;
  const spressoFunction = shopifyFunctions.find(shopifyFunction=>shopifyFunction.title === SPRESSO_FUNCTION_NAME);

  const createFuncResponse = await admin.graphql(
  `mutation cartTransformCreate($functionId: String!) {
    cartTransformCreate(functionId: $functionId) {
      cartTransform{
        id
      }
      userErrors {
        field
        message
      }
    }
  }
  `, 
  {
    variables: {
    "blockOnFailure": true,
    "functionId": spressoFunction.id
    }
  });

  const createFuncResponseJSON = await createFuncResponse.json();

  return {
    id: createFuncResponseJSON.data.cartTransformCreate?.cartTransform?.id,
    errors: createFuncResponseJSON.data.cartTransformCreate?.userErrors
  };

}

async function generateAccessToken() {

}

