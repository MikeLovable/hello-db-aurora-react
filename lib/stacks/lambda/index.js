
#!/usr/bin/env node
const AWS = require('aws-sdk');

/**
 * Lambda function to handle API Gateway requests
 * Manages database operations for Customers, Products, and Orders
 */
exports.handler = async function(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Get environment variables
  const dbClusterArn = process.env.DB_CLUSTER_ARN;
  const dbSecretArn = process.env.DB_SECRET_ARN;
  const dbName = process.env.DB_NAME;
  
  // Create RDS Data API client
  const rdsData = new AWS.RDSDataService();
  
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
  };
  
  // Helper function to execute SQL queries
  async function executeQuery(sql, parameters = []) {
    console.log(`Executing SQL: ${sql}`);
    console.log(`Parameters: ${JSON.stringify(parameters)}`);
    
    try {
      const result = await rdsData.executeStatement({
        resourceArn: dbClusterArn,
        secretArn: dbSecretArn,
        database: dbName,
        sql: sql,
        parameters: parameters,
      }).promise();
      
      console.log('Query result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
  
  // Helper function to format RDS Data API results into JSON objects
  function formatResults(result) {
    if (!result.records) {
      return [];
    }
    
    return result.records.map(record => {
      const item = {};
      for (let i = 0; i < result.columnMetadata.length; i++) {
        const column = result.columnMetadata[i];
        const value = record[i];
        
        // Determine the correct value based on the type
        let formattedValue = null;
        if (value !== null) {
          if (value.stringValue !== undefined) {
            formattedValue = value.stringValue;
          } else if (value.longValue !== undefined) {
            formattedValue = value.longValue;
          } else if (value.doubleValue !== undefined) {
            formattedValue = value.doubleValue;
          } else if (value.booleanValue !== undefined) {
            formattedValue = value.booleanValue;
          } else if (value.blobValue !== undefined) {
            // Handle blob values if needed
            formattedValue = value.blobValue;
          }
        }
        
        item[column.name] = formattedValue;
      }
      return item;
    });
  }
  
  try {
    // Determine the API path from the event
    const path = event.path.split('/').pop();
    const httpMethod = event.httpMethod;
    const queryParams = event.queryStringParameters || {};
    
    console.log(`Handling ${httpMethod} request to ${path}`);
    console.log(`Query parameters:`, queryParams);
    
    let response;
    
    switch (path) {
      case 'GetProducts':
        // Handle GetProducts endpoint
        if (queryParams.ProductID) {
          // Get specific product
          const productResult = await executeQuery(
            'SELECT * FROM Products WHERE ProductID = :productId LIMIT 1',
            [{ name: 'productId', value: { stringValue: queryParams.ProductID } }]
          );
          
          response = formatResults(productResult);
        } else {
          // Get all products (limit 100)
          const productsResult = await executeQuery(
            'SELECT * FROM Products LIMIT 100'
          );
          
          response = formatResults(productsResult);
        }
        break;
        
      case 'GetCustomers':
        // Handle GetCustomers endpoint
        if (queryParams.CustomerID) {
          // Get specific customer
          const customerResult = await executeQuery(
            'SELECT * FROM Customers WHERE CustomerID = :customerId LIMIT 1',
            [{ name: 'customerId', value: { stringValue: queryParams.CustomerID } }]
          );
          
          response = formatResults(customerResult);
        } else {
          // Get all customers (limit 100)
          const customersResult = await executeQuery(
            'SELECT * FROM Customers LIMIT 100'
          );
          
          response = formatResults(customersResult);
        }
        break;
        
      case 'GetOrders':
        // Handle GetOrders endpoint
        let orderSql = `
          SELECT o.OrderID, o.CustomerID, c.FirstName, c.LastName, o.OrderDate, o.Status, o.TotalAmount,
                 od.ProductID, p.ProductName, od.Quantity, od.UnitPrice
          FROM Orders o
          JOIN Customers c ON o.CustomerID = c.CustomerID
          JOIN OrderDetails od ON o.OrderID = od.OrderID
          JOIN Products p ON od.ProductID = p.ProductID
          WHERE 1=1
        `;
        
        const orderParams = [];
        let paramIndex = 0;
        
        // Add filter for CustomerID if provided
        if (queryParams.CustomerID) {
          orderSql += ` AND o.CustomerID = :customerId`;
          orderParams.push({ 
            name: 'customerId', 
            value: { stringValue: queryParams.CustomerID } 
          });
          paramIndex++;
        }
        
        // Add filter for ProductID if provided
        if (queryParams.ProductID) {
          orderSql += ` AND od.ProductID = :productId`;
          orderParams.push({ 
            name: 'productId', 
            value: { stringValue: queryParams.ProductID } 
          });
          paramIndex++;
        }
        
        // Add limit
        orderSql += ' LIMIT 100';
        
        const ordersResult = await executeQuery(orderSql, orderParams);
        response = formatResults(ordersResult);
        break;
        
      case 'TransactOrder':
        // Handle TransactOrder endpoint
        if (httpMethod === 'POST') {
          // Validate required parameters
          if (!queryParams.CustomerID || !queryParams.ProductID) {
            return {
              statusCode: 400,
              headers: headers,
              body: JSON.stringify({
                success: false,
                message: 'CustomerID and ProductID are required parameters',
              }),
            };
          }
          
          // Verify the customer exists
          const customerCheckResult = await executeQuery(
            'SELECT CustomerID FROM Customers WHERE CustomerID = :customerId',
            [{ name: 'customerId', value: { stringValue: queryParams.CustomerID } }]
          );
          
          const customers = formatResults(customerCheckResult);
          if (customers.length === 0) {
            return {
              statusCode: 404,
              headers: headers,
              body: JSON.stringify({
                success: false,
                message: `Customer with ID ${queryParams.CustomerID} not found`,
              }),
            };
          }
          
          // Verify the product exists and get its price
          const productCheckResult = await executeQuery(
            'SELECT ProductID, Price FROM Products WHERE ProductID = :productId',
            [{ name: 'productId', value: { stringValue: queryParams.ProductID } }]
          );
          
          const products = formatResults(productCheckResult);
          if (products.length === 0) {
            return {
              statusCode: 404,
              headers: headers,
              body: JSON.stringify({
                success: false,
                message: `Product with ID ${queryParams.ProductID} not found`,
              }),
            };
          }
          
          const productPrice = products[0].Price;
          
          // Begin a transaction to create the order
          const transactionResult = await rdsData.beginTransaction({
            resourceArn: dbClusterArn,
            secretArn: dbSecretArn,
            database: dbName,
          }).promise();
          
          const transactionId = transactionResult.transactionId;
          
          try {
            // Create the order
            const createOrderResult = await rdsData.executeStatement({
              resourceArn: dbClusterArn,
              secretArn: dbSecretArn,
              database: dbName,
              transactionId: transactionId,
              sql: `
                INSERT INTO Orders (CustomerID, TotalAmount)
                VALUES (:customerId, :totalAmount)
                RETURNING OrderID
              `,
              parameters: [
                { name: 'customerId', value: { stringValue: queryParams.CustomerID } },
                { name: 'totalAmount', value: { doubleValue: productPrice } },
              ],
            }).promise();
            
            const orders = formatResults(createOrderResult);
            const orderId = orders[0].OrderID;
            
            // Create the order details
            await rdsData.executeStatement({
              resourceArn: dbClusterArn,
              secretArn: dbSecretArn,
              database: dbName,
              transactionId: transactionId,
              sql: `
                INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice)
                VALUES (:orderId, :productId, 1, :unitPrice)
              `,
              parameters: [
                { name: 'orderId', value: { longValue: orderId } },
                { name: 'productId', value: { stringValue: queryParams.ProductID } },
                { name: 'unitPrice', value: { doubleValue: productPrice } },
              ],
            }).promise();
            
            // Update product stock quantity (decrement by 1)
            await rdsData.executeStatement({
              resourceArn: dbClusterArn,
              secretArn: dbSecretArn,
              database: dbName,
              transactionId: transactionId,
              sql: `
                UPDATE Products
                SET StockQuantity = StockQuantity - 1
                WHERE ProductID = :productId AND StockQuantity > 0
              `,
              parameters: [
                { name: 'productId', value: { stringValue: queryParams.ProductID } },
              ],
            }).promise();
            
            // Commit the transaction
            await rdsData.commitTransaction({
              resourceArn: dbClusterArn,
              secretArn: dbSecretArn,
              transactionId: transactionId,
            }).promise();
            
            response = {
              success: true,
              message: `Order created successfully with ID: ${orderId}`,
              orderId: orderId,
            };
          } catch (error) {
            // Rollback the transaction on error
            await rdsData.rollbackTransaction({
              resourceArn: dbClusterArn,
              secretArn: dbSecretArn,
              transactionId: transactionId,
            }).promise();
            
            throw error;
          }
        } else {
          return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({
              success: false,
              message: 'Method not allowed for this endpoint',
            }),
          };
        }
        break;
        
      default:
        return {
          statusCode: 404,
          headers: headers,
          body: JSON.stringify({
            success: false,
            message: 'Endpoint not found',
          }),
        };
    }
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        success: false,
        message: `Error: ${error.message}`,
      }),
    };
  }
};
