
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { AuroraPGServerlessInitializedConstructProps } from './interfaces';
import { DatabaseSecretsManager } from './database-secrets-manager';
import { DatabaseInitializer } from './lambda-initializer-custom-resource';

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
    
    // Use the provided VPC
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

    // Create the Aurora PostgreSQL serverless V2 cluster
    this.cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      vpc,
      scaling: {
        minCapacity: props.minAcu ? rds.AuroraCapacityUnit[`ACU_${props.minAcu}`] : rds.AuroraCapacityUnit.ACU_0_5, 
        maxCapacity: props.maxAcu ? rds.AuroraCapacityUnit[`ACU_${props.maxAcu}`] : rds.AuroraCapacityUnit.ACU_1,
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

    // Create the database initializer
    const databaseInitializer = new DatabaseInitializer(this, id, {
      dbName: this.dbName,
      sqlFilesPath: props.sqlFilesPath,
      ddlFiles: props.ddlFiles,
      seedDataFiles: props.seedDataFiles,
      testFiles: props.testFiles,
      cluster: this.cluster,
      customResourceUserSecret: this.customResourceUserSecret,
      vpc: vpc,
    });
  }
}
