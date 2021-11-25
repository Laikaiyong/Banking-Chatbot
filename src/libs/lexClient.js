/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
ABOUT THIS NODE.JS EXAMPLE: This example works with AWS SDK for JavaScript version 3 (v3),
which is available at https://github.com/aws/aws-sdk-js-v3. The example is available here https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/lex-bot-example.html.

Purpose:
lexClient.js is a helper function that creates the Amazon Lex service client.


Inputs (replace in code):
- REGION
- IDENTITY_POOL_ID - an Amazon Cognito Identity Pool ID.
*/
// snippet-start:[lex.JavaScript.lexClient]
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { LexRuntimeV2Client } from "@aws-sdk/client-lex-runtime-v2";

const REGION = "ap-southeast-1";
const IDENTITY_POOL_ID = "ap-southeast-1:6f8e6c69-d9c9-42f5-98a3-f0298c13fae8"; // An Amazon Cognito Identity Pool ID.

// Create an Amazon Lex service client object.
const lexClient = new LexRuntimeV2Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

export { lexClient };
// snippet-end:[lex.JavaScript.lexClient]