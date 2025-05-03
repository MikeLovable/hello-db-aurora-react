
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { AuroraPGServerlessInitializedConstructProps, DatabaseSecrets } from './interfaces';
import { DatabaseSecretsManager } from './database-secrets-manager';

/**
 * A CDK construct that creates an Aurora PostgreSQL serverless V2 database
 * and initializes it with tables and data using a custom resource
 */
export class AuroraPGServerlessInitializedConstruct extends Construct {
  /**
   * The Aurora PostgreSQL Serverless V2 cluster
   */
  public readonly cluster: rds.ServerlessCluster;
  
  /**
   * The name of the database
   */
  public readonly dbName: string;
  
  /**
   * The ARN of the database
   */
  public readonly dbArn: string;
  
  /**
   * The secret for the admin user
   */
  public readonly adminUserSecret: secretsmanager.Secret;
  
  /**
   * The secret for the application user
   */
  public readonly appUserSecret: secretsmanager.Secret;
  
  /**
   * The secret for the custom resource user
   */
  public readonly customResourceUserSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: AuroraPGServerlessInitializedConstructProps) {
    super(scope, id);

    this.dbName = props.dbName;
    
    // Use the provided VPC instead of creating one
    const vpc = props.vpc;

    // Create secrets for database users
    const secrets = DatabaseSecretsManager.createDatabaseSecrets(this, id);
    this.adminUserSecret = secrets.adminUserSecret;
    this.appUserSecret = secrets.appUserSecret;
    this.customResourceUserSecret = secrets.customResourceUserSecret;

    // Create security group for the database
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for Aurora PostgreSQL database',
      allowAllOutbound: true,
    });

    // Get available subnet types
    const vpcSubnets = {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Use private subnets with NAT gateway
    };

    // Create the Aurora PostgreSQL serverless V2 cluster
    this.cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_2, // Fixed to a valid version
      }),
      vpc,
      scaling: {
        minCapacity: rds.AuroraCapacityUnit.ACU_1, // Fixed to a valid minimum capacity
        maxCapacity: rds.AuroraCapacityUnit.ACU_2, // Increased for better performance
      },
      defaultDatabaseName: props.dbName,
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.adminUserSecret),
      deletionProtection: false, // For easier cleanup in dev/test environments
      vpcSubnets: vpcSubnets,
    });

    this.dbArn = this.cluster.clusterArn;

    // Create a Lambda function for the custom resource to initialize the database
    const initializerLambda = new lambda.Function(this, 'AuroraInitializerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-initializer')),
      timeout: Duration.minutes(15),
      environment: {
        DB_CLUSTER_ARN: this.cluster.clusterArn,
        DB_SECRET_ARN: this.customResourceUserSecret.secretArn,
        DB_NAME: props.dbName,
        SQL_FILES_PATH: props.sqlFilesPath,
        DDL_FILES: JSON.stringify(props.ddlFiles),
        SEED_DATA_FILES: JSON.stringify(props.seedDataFiles),
        TEST_FILES: JSON.stringify(props.testFiles),
      },
      vpc,
      vpcSubnets: vpcSubnets,
    });

    // Grant permissions to the Lambda function
    this.customResourceUserSecret.grantRead(initializerLambda);
    this.cluster.grantDataApiAccess(initializerLambda);

    // Create the custom resource using a Lambda-backed custom resource
    const customResource = new cdk.CustomResource(this, 'AuroraInitializerCustomResource', {
      serviceToken: new lambda.Function(this, 'AuroraInitializerCRFunction', {
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
              FunctionName: '${initializerLambda.functionName}',
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
        vpc,
        vpcSubnets: vpcSubnets,
      }).functionArn,
    });

    // Make sure custom resource runs after the cluster is created
    customResource.node.addDependency(this.cluster);

    // Grant initializerLambda permission to be invoked by the custom resource lambda
    initializerLambda.grantInvoke(new iam.ServicePrincipal('lambda.amazonaws.com'));
  }
}
