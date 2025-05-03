
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';
import { Construct } from 'constructs';
import { AuroraPGServerlessInitializedConstruct } from '../constructs/aurora-pg-serverless-initialized';
import * as fs from 'fs';

/**
 * Test stack for the AuroraPGServerlessInitializedConstruct
 * Creates database, API, and Lambda infrastructure
 */
export class AuroraPGServerlessInitializedConstructTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create VPC for our resources
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 1,
    });
    
    // Generate SQL files for DDL
    const sqlFilesDir = path.join(__dirname, '..', '..', 'SQLFiles');
    if (!fs.existsSync(sqlFilesDir)) {
      fs.mkdirSync(sqlFilesDir, { recursive: true });
    }
    
    // Create DDL file for Customer and Product tables
    const ddlFile1 = 'create-tables-1.sql';
    fs.writeFileSync(
      path.join(sqlFilesDir, ddlFile1),
      `
-- Create Customers table
CREATE TABLE IF NOT EXISTS Customers (
  CustomerID VARCHAR(5) PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(255) UNIQUE NOT NULL,
  Phone VARCHAR(20),
  Address VARCHAR(255),
  City VARCHAR(100),
  State VARCHAR(50),
  PostalCode VARCHAR(20),
  Country VARCHAR(100),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS Products (
  ProductID VARCHAR(5) PRIMARY KEY,
  ProductName VARCHAR(255) NOT NULL,
  Description TEXT,
  Category VARCHAR(100),
  Price DECIMAL(10, 2) NOT NULL,
  StockQuantity INT NOT NULL DEFAULT 0,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `
    );
    
    // Create DDL file for Orders table with relationships
    const ddlFile2 = 'create-tables-2.sql';
    fs.writeFileSync(
      path.join(sqlFilesDir, ddlFile2),
      `
-- Create Orders table with relationships
CREATE TABLE IF NOT EXISTS Orders (
  OrderID SERIAL PRIMARY KEY,
  CustomerID VARCHAR(5) NOT NULL,
  OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Status VARCHAR(50) DEFAULT 'Pending',
  TotalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Create OrderDetails table for many-to-many relationship
CREATE TABLE IF NOT EXISTS OrderDetails (
  OrderDetailID SERIAL PRIMARY KEY,
  OrderID INT NOT NULL,
  ProductID VARCHAR(5) NOT NULL,
  Quantity INT NOT NULL DEFAULT 1,
  UnitPrice DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
      `
    );
    
    // Create test data file for Customers and Products
    const testFile1 = 'test-data-1.sql';
    fs.writeFileSync(
      path.join(sqlFilesDir, testFile1),
      `
-- Insert sample customers
INSERT INTO Customers (CustomerID, FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country)
VALUES
  ('C0001', 'John', 'Doe', 'john.doe@example.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA'),
  ('C0002', 'Jane', 'Smith', 'jane.smith@example.com', '555-234-5678', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA'),
  ('C0003', 'Robert', 'Johnson', 'robert.j@example.com', '555-345-6789', '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA'),
  ('C0004', 'Emily', 'Williams', 'emily.w@example.com', '555-456-7890', '321 Elm St', 'Houston', 'TX', '77001', 'USA'),
  ('C0005', 'Michael', 'Brown', 'michael.b@example.com', '555-567-8901', '654 Maple Ave', 'Phoenix', 'AZ', '85001', 'USA'),
  ('C0006', 'Sarah', 'Davis', 'sarah.d@example.com', '555-678-9012', '987 Cedar Blvd', 'Philadelphia', 'PA', '19101', 'USA'),
  ('C0007', 'David', 'Miller', 'david.m@example.com', '555-789-0123', '147 Birch Ln', 'San Antonio', 'TX', '78201', 'USA'),
  ('C0008', 'Jennifer', 'Wilson', 'jennifer.w@example.com', '555-890-1234', '258 Willow St', 'San Diego', 'CA', '92101', 'USA'),
  ('C0009', 'Richard', 'Moore', 'richard.m@example.com', '555-901-2345', '369 Spruce Ct', 'Dallas', 'TX', '75201', 'USA'),
  ('C0010', 'Elizabeth', 'Taylor', 'elizabeth.t@example.com', '555-012-3456', '470 Ash Dr', 'San Jose', 'CA', '95101', 'USA');

-- Insert sample products
INSERT INTO Products (ProductID, ProductName, Description, Category, Price, StockQuantity)
VALUES
  ('P0001', 'Laptop Pro', 'High-performance laptop with 16GB RAM', 'Electronics', 1299.99, 50),
  ('P0002', 'Smartphone X', 'Latest smartphone with advanced camera', 'Electronics', 899.99, 100),
  ('P0003', 'Wireless Headphones', 'Noise-cancelling wireless headphones', 'Electronics', 199.99, 200),
  ('P0004', 'Coffee Maker', 'Automatic coffee maker with timer', 'Kitchen', 79.99, 75),
  ('P0005', 'Running Shoes', 'Lightweight running shoes for athletes', 'Sportswear', 129.99, 150),
  ('P0006', 'Yoga Mat', 'Non-slip yoga mat for exercise', 'Fitness', 29.99, 300),
  ('P0007', 'Desk Lamp', 'LED desk lamp with adjustable brightness', 'Home', 39.99, 125),
  ('P0008', 'Backpack', 'Waterproof backpack for hiking', 'Outdoor', 59.99, 80),
  ('P0009', 'Water Bottle', 'Insulated water bottle, 32oz', 'Kitchen', 24.99, 400),
  ('P0010', 'Bluetooth Speaker', 'Portable bluetooth speaker with 20hr battery', 'Electronics', 89.99, 90);
      `
    );
    
    // Create test data file for Orders
    const testFile2 = 'test-data-2.sql';
    fs.writeFileSync(
      path.join(sqlFilesDir, testFile2),
      `
-- Insert sample orders
INSERT INTO Orders (CustomerID, OrderDate, Status, TotalAmount)
VALUES
  ('C0001', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Completed', 1299.99),
  ('C0002', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Completed', 199.99),
  ('C0003', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Shipped', 129.99),
  ('C0004', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Processing', 39.99),
  ('C0001', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Processing', 89.99),
  ('C0005', CURRENT_TIMESTAMP, 'Pending', 24.99);

-- Insert sample order details
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice)
VALUES
  (1, 'P0001', 1, 1299.99),
  (2, 'P0003', 1, 199.99),
  (3, 'P0005', 1, 129.99),
  (4, 'P0007', 1, 39.99),
  (5, 'P0010', 1, 89.99),
  (6, 'P0009', 1, 24.99);
      `
    );
    
    // Create Aurora PostgreSQL serverless database using our construct
    // Now explicitly passing the required VPC parameter
    const auroraConstruct = new AuroraPGServerlessInitializedConstruct(this, 'AuroraDatabase', {
      dbName: 'hellodb',
      sqlFilesPath: 'SQLFiles',
      ddlFiles: [ddlFile1, ddlFile2],
      seedDataFiles: [],
      testFiles: [testFile1, testFile2],
      vpc, // Explicitly passing the VPC
      minAcu: 0.5,
      maxAcu: 1,
    });
    
    // Create Lambda function for API
    const dataManagerFunction = new lambda.Function(this, 'DataManagerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        DB_CLUSTER_ARN: auroraConstruct.cluster.clusterArn,
        DB_SECRET_ARN: auroraConstruct.appUserSecret.secretArn,
        DB_NAME: auroraConstruct.dbName,
      },
      timeout: cdk.Duration.seconds(30),
      vpc,
    });
    
    // Grant permissions to the Lambda function
    auroraConstruct.appUserSecret.grantRead(dataManagerFunction);
    auroraConstruct.cluster.grantDataApiAccess(dataManagerFunction);
    
    // Create API Gateway
    const api = new apigateway.RestApi(this, 'DataManagerAPI', {
      restApiName: 'DataManagerAPI',
      description: 'API for managing data in Aurora PostgreSQL',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      },
    });
    
    // Create API resources and methods
    const productsResource = api.root.addResource('GetProducts');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(dataManagerFunction), {
      requestParameters: {
        'method.request.querystring.ProductID': false, // Optional parameter
      },
    });
    
    const customersResource = api.root.addResource('GetCustomers');
    customersResource.addMethod('GET', new apigateway.LambdaIntegration(dataManagerFunction), {
      requestParameters: {
        'method.request.querystring.CustomerID': false, // Optional parameter
      },
    });
    
    const ordersResource = api.root.addResource('GetOrders');
    ordersResource.addMethod('GET', new apigateway.LambdaIntegration(dataManagerFunction), {
      requestParameters: {
        'method.request.querystring.CustomerID': false, // Optional parameter
        'method.request.querystring.ProductID': false, // Optional parameter
      },
    });
    
    const transactResource = api.root.addResource('TransactOrder');
    transactResource.addMethod('POST', new apigateway.LambdaIntegration(dataManagerFunction), {
      requestParameters: {
        'method.request.querystring.CustomerID': true, // Required parameter
        'method.request.querystring.ProductID': true, // Required parameter
      },
    });
    
    // Output the important resource information
    new cdk.CfnOutput(this, 'DatabaseName', {
      value: auroraConstruct.dbName,
      description: 'Aurora PostgreSQL database name',
    });
    
    new cdk.CfnOutput(this, 'DatabaseArn', {
      value: auroraConstruct.dbArn,
      description: 'Aurora PostgreSQL database ARN',
    });
    
    new cdk.CfnOutput(this, 'AdminSecretArn', {
      value: auroraConstruct.adminUserSecret.secretArn,
      description: 'ARN of the admin user secret',
    });
    
    new cdk.CfnOutput(this, 'AppSecretArn', {
      value: auroraConstruct.appUserSecret.secretArn,
      description: 'ARN of the app user secret',
    });
    
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
    });
  }
}
