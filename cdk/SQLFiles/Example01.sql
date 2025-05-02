
-- Example01.sql: SELECT data from Customers table
-- AWS CLI Command:
-- aws rds-data execute-statement \
--  --resource-arn "YOUR_CLUSTER_ARN" \
--  --secret-arn "YOUR_APP_SECRET_ARN" \
--  --database "hellodb" \
--  --sql "SELECT * FROM Customers LIMIT 5" \
--  --output json | tee example01_output.json

SELECT * FROM Customers LIMIT 5;
