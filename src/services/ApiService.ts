
import { Customer, Product, Order } from '@/types';
import { MockApiService } from './MockApiService';
import { ApiUrlDisplay } from '@/components/ApiUrlConfig';

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
   * Set the base URL for API calls
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Set API mode (true for API, false for mock)
   */
  setApiMode(useApi: boolean) {
    this.useMock = !useApi;
  }

  /**
   * Get all customers or a specific customer by ID
   */
  async getCustomers(customerId?: string): Promise<Customer[]> {
    // Use mock service if specified
    if (this.useMock) {
      ApiUrlDisplay.updateInvokedUrl('LOCAL');
      return MockApiService.getCustomers(customerId);
    }
    
    try {
      let url = `${this.baseUrl}/GetCustomers`;
      if (customerId) {
        url += `?CustomerID=${encodeURIComponent(customerId)}`;
      }

      ApiUrlDisplay.updateInvokedUrl(url);

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
    // Use mock service if specified
    if (this.useMock) {
      ApiUrlDisplay.updateInvokedUrl('LOCAL');
      return MockApiService.getProducts(productId);
    }
    
    try {
      let url = `${this.baseUrl}/GetProducts`;
      if (productId) {
        url += `?ProductID=${encodeURIComponent(productId)}`;
      }

      ApiUrlDisplay.updateInvokedUrl(url);
      
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
    // Use mock service if specified
    if (this.useMock) {
      ApiUrlDisplay.updateInvokedUrl('LOCAL');
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

      ApiUrlDisplay.updateInvokedUrl(url);
      
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
    // Use mock service if specified
    if (this.useMock) {
      ApiUrlDisplay.updateInvokedUrl('LOCAL');
      return MockApiService.createOrder(customerId, productId);
    }
    
    try {
      const url = `${this.baseUrl}/TransactOrder?CustomerID=${encodeURIComponent(customerId)}&ProductID=${encodeURIComponent(productId)}`;
      
      ApiUrlDisplay.updateInvokedUrl(url);
      
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
