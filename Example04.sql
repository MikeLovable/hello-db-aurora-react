
-- Example04.sql: DELETE a Customer record
-- AWS CLI Command:
-- aws rds-data execute-statement \
--  --resource-arn "YOUR_CLUSTER_ARN" \
--  --secret-arn "YOUR_APP_SECRET_ARN" \
--  --database "hellodb" \
--  --sql "DELETE FROM Customers WHERE CustomerID = 'C0011'" \
--  --output json | tee example04_output.json

DELETE FROM Customers 
WHERE CustomerID = 'C0011';
