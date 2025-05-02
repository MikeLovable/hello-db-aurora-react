
-- Example02.sql: INSERT a new Customer
-- AWS CLI Command:
-- aws rds-data execute-statement \
--  --resource-arn "YOUR_CLUSTER_ARN" \
--  --secret-arn "YOUR_APP_SECRET_ARN" \
--  --database "hellodb" \
--  --sql "INSERT INTO Customers (CustomerID, FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country) VALUES ('C0011', 'Alice', 'Johnson', 'alice.j@example.com', '555-123-7890', '123 Maple St', 'Boston', 'MA', '02108', 'USA')" \
--  --output json | tee example02_output.json

INSERT INTO Customers (CustomerID, FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country) 
VALUES ('C0011', 'Alice', 'Johnson', 'alice.j@example.com', '555-123-7890', '123 Maple St', 'Boston', 'MA', '02108', 'USA');
