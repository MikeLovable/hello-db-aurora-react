
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuroraPGServerlessInitializedConstructTestStack } from '../lib/stacks/aurora-pg-serverless-initialized-test-stack';

/**
 * CDK app entry point for HelloDB
 * Creates the test stack with Aurora PostgreSQL, API Gateway, and Lambda
 */
const app = new cdk.App();
new AuroraPGServerlessInitializedConstructTestStack(app, 'HelloDbStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  description: 'Test stack for AuroraPGServerlessInitializedConstruct',
});
