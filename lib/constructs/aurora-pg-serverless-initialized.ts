
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as fs from 'fs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

/**
 * Properties for the AuroraPGServerlessInitializedConstruct
 */
export interface AuroraPGServerlessInitializedConstructProps {
  /**
   * The name of the database to create
   */
  readonly dbName: string;
  
  /**
   * Relative path to the directory containing SQL files
   */
  readonly sqlFilesPath: string;
  
  /**
   * Array of SQL file names for DDL (table creation)
   */
  readonly ddlFiles: string[];
  
  /**
   * Array of SQL file names for seed data
   */
  readonly seedDataFiles: string[];
  
  /**
   * Array of SQL file names for test data
   */
  readonly testFiles: string[];
  
  /**
   * VPC where the database will be deployed
   * If not provided, a new VPC will be created
   */
  readonly vpc?: ec2.IVpc;
  
  /**
   * Minimum ACU for serverless capacity
   * Default is 0.5 (minimum value)
   */
  readonly minAcu?: number;
  
  /**
   * Maximum ACU for serverless capacity
   * Default is 1 (minimum for production is recommended to be higher)
   */
  readonly maxAcu?: number;
}

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
    
    // Create VPC if not provided
    const vpc = props.vpc ?? new ec2.Vpc(this, 'DatabaseVpc', {
      maxAzs: 2,
      natGateways: 0, // To minimize costs
    });

    // Create secrets for database users
    this.adminUserSecret = new secretsmanager.Secret(this, 'AdminUserSecret', {
      secretName: `${id}-admin-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'adminuser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    this.appUserSecret = new secretsmanager.Secret(this, 'AppUserSecret', {
      secretName: `${id}-app-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'appuser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    this.customResourceUserSecret = new secretsmanager.Secret(this, 'CustomResourceUserSecret', {
      secretName: `${id}-cr-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'cruser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    // Create security group for the database
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for Aurora PostgreSQL database',
      allowAllOutbound: true,
    });

    // Create the Aurora PostgreSQL serverless V2 cluster
    this.cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      vpc,
      scaling: {
        minCapacity: rds.AuroraCapacityUnit.ACU_0_5, // Minimum ACU
        maxCapacity: rds.AuroraCapacityUnit.ACU_1, // Maximum ACU
      },
      defaultDatabaseName: props.dbName,
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.adminUserSecret),
      deletionProtection: false, // For easier cleanup in dev/test environments
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
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
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
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
      }).functionArn,
    });

    // Make sure custom resource runs after the cluster is created
    customResource.node.addDependency(this.cluster);

    // Grant initializerLambda permission to be invoked by the custom resource lambda
    initializerLambda.grantInvoke(new iam.ServicePrincipal('lambda.amazonaws.com'));
  }
}
