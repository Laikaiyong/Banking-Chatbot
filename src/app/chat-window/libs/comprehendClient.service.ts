import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { ComprehendClient } from '@aws-sdk/client-comprehend';

const REGION = 'ap-southeast-1';
const IDENTITY_POOL_ID = 'ap-southeast-1:6f8e6c69-d9c9-42f5-98a3-f0298c13fae8'; // An Amazon Cognito Identity Pool ID.

// Create an Amazon Comprehend service client object.
const comprehendClient = new ComprehendClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

export { comprehendClient };
