
# HelloDB Application

This project is a two-tier web application with a React frontend and AWS backend.

## Project Structure

The project is organized into two main parts:

### Frontend (React)

The frontend is a React application located in the root directory:

- `src/` - React application source code
- `public/` - Static assets
- `package.json` - Frontend dependencies and scripts

### Backend (AWS CDK)

The backend is implemented using AWS CDK and is located in the `cdk/` directory:

- `cdk/bin/` - CDK app entry point
- `cdk/lib/` - CDK constructs and stacks
- `cdk/SQLFiles/` - SQL files for database initialization

## Getting Started

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the CDK directory:
   ```
   cd cdk
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy the AWS stack:
   ```
   npm run cdk deploy
   ```

4. After deployment, update the API URL in `src/services/ApiService.ts` with the API Gateway URL from the CDK outputs.

## Features

- Browse and search Customers
- Browse and search Products
- Create Orders by selecting a Customer and Product

## Database Structure

The application uses Aurora PostgreSQL Serverless with the following tables:

- Customers
- Products
- Orders
- OrderDetails
