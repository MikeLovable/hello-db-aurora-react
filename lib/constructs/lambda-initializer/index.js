
#!/usr/bin/env node
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

/**
 * Lambda function to initialize an Aurora PostgreSQL database with schema and data
 * This function is called by the custom resource during CDK deployment
 */
exports.handler = async function(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get environment variables
    const dbClusterArn = process.env.DB_CLUSTER_ARN;
    const dbSecretArn = process.env.DB_SECRET_ARN;
    const dbName = process.env.DB_NAME;
    const sqlFilesPath = process.env.SQL_FILES_PATH;
    const ddlFiles = JSON.parse(process.env.DDL_FILES || '[]');
    const seedDataFiles = JSON.parse(process.env.SEED_DATA_FILES || '[]');
    const testFiles = JSON.parse(process.env.TEST_FILES || '[]');
    
    console.log(`Initializing database ${dbName} with SQL files from ${sqlFilesPath}`);
    console.log(`DDL Files: ${JSON.stringify(ddlFiles)}`);
    console.log(`Seed Data Files: ${JSON.stringify(seedDataFiles)}`);
    console.log(`Test Files: ${JSON.stringify(testFiles)}`);
    
    // Create RDS Data API client
    const rdsData = new AWS.RDSDataService();
    
    // Helper function to execute SQL queries
    async function executeQuery(sql, description) {
      console.log(`Executing ${description}: ${sql.substring(0, 100)}...`);
      
      try {
        const response = await rdsData.executeStatement({
          resourceArn: dbClusterArn,
          secretArn: dbSecretArn,
          database: dbName,
          sql: sql,
          continueAfterTimeout: true,
        }).promise();
        
        console.log(`Successfully executed ${description}`);
        return response;
      } catch (error) {
        console.error(`Error executing ${description}:`, error);
        throw new Error(`Failed to execute ${description}: ${error.message}`);
      }
    }
    
    // Helper function to read SQL file
    function readSqlFile(fileName) {
      try {
        // In Lambda, the code directory is the current working directory
        const filePath = path.join(process.cwd(), sqlFilesPath, fileName);
        console.log(`Reading SQL file: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
          throw new Error(`SQL file does not exist: ${filePath}`);
        }
        
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Successfully read SQL file ${fileName} (${sql.length} bytes)`);
        return sql;
      } catch (error) {
        console.error(`Error reading SQL file ${fileName}:`, error);
        throw new Error(`Failed to read SQL file ${fileName}: ${error.message}`);
      }
    }
    
    // Execute DDL files first to create tables and relationships
    console.log('Processing DDL files...');
    for (const ddlFile of ddlFiles) {
      const sql = readSqlFile(ddlFile);
      await executeQuery(sql, `DDL file ${ddlFile}`);
    }
    
    // Execute seed data files to populate tables with initial data
    console.log('Processing seed data files...');
    for (const seedDataFile of seedDataFiles) {
      const sql = readSqlFile(seedDataFile);
      await executeQuery(sql, `Seed data file ${seedDataFile}`);
    }
    
    // Execute test data files to populate tables with test data
    console.log('Processing test data files...');
    for (const testFile of testFiles) {
      const sql = readSqlFile(testFile);
      await executeQuery(sql, `Test file ${testFile}`);
    }
    
    console.log('Database initialization completed successfully');
    return {
      success: true,
      message: 'Database initialization completed successfully',
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error(`Database initialization failed: ${error.message}`);
  }
};
