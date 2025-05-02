
-- Example03.sql: UPDATE a Customer record
-- AWS CLI Command:
-- aws rds-data execute-statement \
--  --resource-arn "YOUR_CLUSTER_ARN" \
--  --secret-arn "YOUR_APP_SECRET_ARN" \
--  --database "hellodb" \
--  --sql "UPDATE Customers SET Phone = '555-999-8888', Address = '456 Oak Ave' WHERE CustomerID = 'C0011'" \
--  --output json | tee example03_output.json

UPDATE Customers 
SET Phone = '555-999-8888', Address = '456 Oak Ave' 
WHERE CustomerID = 'C0011';
