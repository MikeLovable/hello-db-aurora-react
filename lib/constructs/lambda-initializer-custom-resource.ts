
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

/**
 * Properties for creating a database initializer lambda
 */
interface DatabaseInitializerProps {
  dbName: string;
  sqlFilesPath: string;
  ddlFiles: string[];
  seedDataFiles: string[];
  testFiles: string[];
  cluster: rds.ServerlessCluster;
  customResourceUserSecret: secretsmanager.Secret;
  vpc: ec2.IVpc;
}

/**
 * Creates Lambda functions and custom resources for database initialization
 */
export class DatabaseInitializer {
  /**
   * The Lambda function that initializes the database
   */
  public readonly initializerLambda: lambda.Function;
  
  /**
   * The custom resource that triggers the initialization
   */
  public readonly customResource: cdk.CustomResource;

  constructor(scope: Construct, id: string, props: DatabaseInitializerProps) {
    // Create a Lambda function for the custom resource to initialize the database
    this.initializerLambda = new lambda.Function(scope, 'AuroraInitializerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-initializer')),
      timeout: Duration.minutes(15),
      environment: {
        DB_CLUSTER_ARN: props.cluster.clusterArn,
        DB_SECRET_ARN: props.customResourceUserSecret.secretArn,
        DB_NAME: props.dbName,
        SQL_FILES_PATH: props.sqlFilesPath,
        DDL_FILES: JSON.stringify(props.ddlFiles),
        SEED_DATA_FILES: JSON.stringify(props.seedDataFiles),
        TEST_FILES: JSON.stringify(props.testFiles),
      },
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // Grant permissions to the Lambda function
    props.customResourceUserSecret.grantRead(this.initializerLambda);
    props.cluster.grantDataApiAccess(this.initializerLambda);

    // Create the custom resource using a Lambda-backed custom resource
    this.customResource = new cdk.CustomResource(scope, 'AuroraInitializerCustomResource', {
      serviceToken: new lambda.Function(scope, 'AuroraInitializerCRFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const response = require('cfn-response');
        
        exports.handler = async function(event, context) {
          console.log('Event:', JSON.stringify(event, null, 2));
          
          // Ignore DELETE events
          if (event.RequestType === 'Delete') {
            return response.send(event, context, response.SUCCESS);
          }
          
          const lambda = new AWS.Lambda();
          
          try {
            // Invoke the database initializer lambda
            console.log('Invoking database initializer lambda');
            const result = await lambda.invoke({
              FunctionName: '${this.initializerLambda.functionName}',
              InvocationType: 'RequestResponse',
            }).promise();
            
            console.log('Initializer lambda response:', result);
            
            if (result.StatusCode !== 200 || (result.FunctionError && result.FunctionError !== '')) {
              throw new Error('Initializer lambda failed: ' + (result.FunctionError || 'Unknown error'));
            }
            
            // Parse the payload from the lambda response
            const payload = JSON.parse(result.Payload.toString());
            
            if (!payload.success) {
              throw new Error('Database initialization failed: ' + payload.message);
            }
            
            return response.send(event, context, response.SUCCESS, {
              Message: 'Database initialized successfully',
              DatabaseName: process.env.DB_NAME,
            });
          } catch (error) {
            console.error('Error initializing database:', error);
            return response.send(event, context, response.FAILED, {
              Message: 'Database initialization failed: ' + error.message,
            });
          }
        }
        `),
        environment: {
          DB_NAME: props.dbName,
        },
        timeout: Duration.minutes(5),
      }).functionArn,
    });

    // Make sure custom resource runs after the cluster is created
    this.customResource.node.addDependency(props.cluster);

    // Grant initializerLambda permission to be invoked by the custom resource lambda
    this.initializerLambda.grantInvoke(new iam.ServicePrincipal('lambda.amazonaws.com'));
  }
}
