
/**
 * Service for interacting with the HelloDB API
 * Provides methods for fetching customers, products, orders and creating new orders
 */
export class ApiService {
  // Base URL for the API - this would be replaced with the actual API URL from CDK outputs
  private static readonly API_BASE_URL = 'https://yourapigatewayurl.execute-api.region.amazonaws.com/prod';

  /**
   * Fetch all customers or a specific customer by ID
   * @param customerId Optional customer ID to fetch a specific customer
   * @returns Promise resolving to customers data
   */
  static async getCustomers(customerId?: string) {
    try {
      const url = new URL(`${this.API_BASE_URL}/GetCustomers`);
      if (customerId) {
        url.searchParams.append('CustomerID', customerId);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Fetch all products or a specific product by ID
   * @param productId Optional product ID to fetch a specific product
   * @returns Promise resolving to products data
   */
  static async getProducts(productId?: string) {
    try {
      const url = new URL(`${this.API_BASE_URL}/GetProducts`);
      if (productId) {
        url.searchParams.append('ProductID', productId);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Fetch orders with optional filtering by customer ID or product ID
   * @param customerId Optional customer ID to filter orders
   * @param productId Optional product ID to filter orders
   * @returns Promise resolving to orders data
   */
  static async getOrders(customerId?: string, productId?: string) {
    try {
      const url = new URL(`${this.API_BASE_URL}/GetOrders`);
      if (customerId) {
        url.searchParams.append('CustomerID', customerId);
      }
      if (productId) {
        url.searchParams.append('ProductID', productId);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Create a new order for a customer and product
   * @param customerId Customer ID making the order
   * @param productId Product ID being ordered
   * @returns Promise resolving to order creation result
   */
  static async createOrder(customerId: string, productId: string) {
    try {
      const url = new URL(`${this.API_BASE_URL}/TransactOrder`);
      url.searchParams.append('CustomerID', customerId);
      url.searchParams.append('ProductID', productId);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update the API base URL - useful for configuration after deployment
   * @param newUrl The new API base URL
   */
  static updateApiBaseUrl(newUrl: string) {
    (this as any).API_BASE_URL = newUrl;
  }
}
