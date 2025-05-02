
# HelloDB CDK Backend

This is the CDK infrastructure code for the HelloDB application. It creates and manages the following AWS resources:

- Aurora PostgreSQL Serverless database
- API Gateway
- Lambda functions

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Project Structure

- `bin/` - Contains the entry point for the CDK app
- `lib/` - Contains the CDK constructs and stacks
  - `constructs/` - Reusable CDK constructs
  - `stacks/` - CDK stacks that use the constructs
- `SQLFiles/` - SQL files used for database initialization
