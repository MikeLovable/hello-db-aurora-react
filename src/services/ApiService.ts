
import { Customer, Product, Order } from '@/types';
import { MockApiService } from './MockApiService';

class ApiServiceClass {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    // This will need to be updated with the real API endpoint after CDK deployment
    this.baseUrl = 'https://your-api-gateway-url.amazonaws.com';
    
    // Use mock service for development
    this.useMock = true;
  }

  /**
   * Get all customers or a specific customer by ID
   */
  async getCustomers(customerId?: string): Promise<Customer[]> {
    // Use mock service for development
    if (this.useMock) {
      return MockApiService.getCustomers(customerId);
    }
    
    try {
      let url = `${this.baseUrl}/GetCustomers`;
      if (customerId) {
        url += `?CustomerID=${encodeURIComponent(customerId)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get all products or a specific product by ID
   */
  async getProducts(productId?: string): Promise<Product[]> {
    // Use mock service for development
    if (this.useMock) {
      return MockApiService.getProducts(productId);
    }
    
    try {
      let url = `${this.baseUrl}/GetProducts`;
      if (productId) {
        url += `?ProductID=${encodeURIComponent(productId)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get orders filtered by customer ID and/or product ID
   */
  async getOrders(customerId?: string, productId?: string): Promise<Order[]> {
    // Use mock service for development
    if (this.useMock) {
      return MockApiService.getOrders(customerId, productId);
    }
    
    try {
      let url = `${this.baseUrl}/GetOrders`;
      const params = new URLSearchParams();
      
      if (customerId) {
        params.append('CustomerID', customerId);
      }
      
      if (productId) {
        params.append('ProductID', productId);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Create a new order for a customer and product
   */
  async createOrder(customerId: string, productId: string): Promise<any> {
    // Use mock service for development
    if (this.useMock) {
      return MockApiService.createOrder(customerId, productId);
    }
    
    try {
      const url = `${this.baseUrl}/TransactOrder?CustomerID=${encodeURIComponent(customerId)}&ProductID=${encodeURIComponent(productId)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const ApiService = new ApiServiceClass();
