
/**
 * Types for API data
 */
export interface Customer {
  CustomerID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  CreatedAt: string;
}

export interface Product {
  ProductID: string;
  ProductName: string;
  Description: string;
  Category: string;
  Price: number;
  StockQuantity: number;
  CreatedAt: string;
}

export interface Order {
  OrderID: number;
  CustomerID: string;
  FirstName: string;
  LastName: string;
  OrderDate: string;
  Status: string;
  TotalAmount: number;
  ProductID: string;
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
}

export interface ApiResponse<T> {
  data: T[];
  error?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  orderId?: number;
}

// Replace with your actual API Gateway URL
const API_BASE_URL = 'https://yourapigatewayurl.execute-api.region.amazonaws.com/prod';

/**
 * Service for making API calls to the AWS backend
 */
class ApiService {
  /**
   * Fetch all customers or a specific customer by ID
   */
  async getCustomers(customerID?: string): Promise<ApiResponse<Customer>> {
    try {
      let url = `${API_BASE_URL}/GetCustomers`;
      if (customerID) {
        url += `?CustomerID=${encodeURIComponent(customerID)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Fetch all products or a specific product by ID
   */
  async getProducts(productID?: string): Promise<ApiResponse<Product>> {
    try {
      let url = `${API_BASE_URL}/GetProducts`;
      if (productID) {
        url += `?ProductID=${encodeURIComponent(productID)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Fetch orders with optional customer and product filters
   */
  async getOrders(customerID?: string, productID?: string): Promise<ApiResponse<Order>> {
    try {
      let url = `${API_BASE_URL}/GetOrders`;
      const params = new URLSearchParams();
      
      if (customerID) {
        params.append('CustomerID', customerID);
      }
      
      if (productID) {
        params.append('ProductID', productID);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Create a new order transaction
   */
  async transactOrder(customerID: string, productID: string): Promise<TransactionResponse> {
    try {
      const url = `${API_BASE_URL}/TransactOrder?CustomerID=${encodeURIComponent(customerID)}&ProductID=${encodeURIComponent(productID)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Transaction failed',
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error creating order transaction:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
