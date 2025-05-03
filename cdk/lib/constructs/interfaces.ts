
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

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
   * Required parameter
   */
  readonly vpc: ec2.IVpc;
  
  /**
   * Minimum ACU for serverless capacity
   * Must be a valid Aurora Capacity Unit value from rds.AuroraCapacityUnit
   */
  readonly minAcu?: number;
  
  /**
   * Maximum ACU for serverless capacity
   * Must be a valid Aurora Capacity Unit value from rds.AuroraCapacityUnit
   */
  readonly maxAcu?: number;
}

/**
 * Interface for database secrets
 */
export interface DatabaseSecrets {
  adminUserSecret: secretsmanager.Secret;
  appUserSecret: secretsmanager.Secret;
  customResourceUserSecret: secretsmanager.Secret;
}

/**
 * Interface representing the result of database cluster creation
 */
export interface DatabaseClusterResult {
  cluster: rds.ServerlessCluster;
  dbArn: string;
}
