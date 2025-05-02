
-- Example05.sql: JOIN query to see all orders with customer and product details
-- AWS CLI Command:
-- aws rds-data execute-statement \
--  --resource-arn "YOUR_CLUSTER_ARN" \
--  --secret-arn "YOUR_APP_SECRET_ARN" \
--  --database "hellodb" \
--  --sql "SELECT o.OrderID, c.CustomerID, c.FirstName, c.LastName, p.ProductID, p.ProductName, od.Quantity, od.UnitPrice, o.OrderDate, o.Status FROM Orders o JOIN Customers c ON o.CustomerID = c.CustomerID JOIN OrderDetails od ON o.OrderID = od.OrderID JOIN Products p ON od.ProductID = p.ProductID" \
--  --output json | tee example05_output.json

SELECT o.OrderID, c.CustomerID, c.FirstName, c.LastName, p.ProductID, p.ProductName, 
       od.Quantity, od.UnitPrice, o.OrderDate, o.Status 
FROM Orders o 
JOIN Customers c ON o.CustomerID = c.CustomerID 
JOIN OrderDetails od ON o.OrderID = od.OrderID 
JOIN Products p ON od.ProductID = p.ProductID;
