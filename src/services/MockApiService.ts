
import { Customer, Product, Order } from '@/types';

// Mock data for development purposes
const mockCustomers: Customer[] = [
  {
    CustomerID: 'C0001',
    FirstName: 'John',
    LastName: 'Doe',
    Email: 'john.doe@example.com',
    Phone: '555-123-4567',
    Address: '123 Main St',
    City: 'New York',
    State: 'NY',
    PostalCode: '10001',
    Country: 'USA'
  },
  {
    CustomerID: 'C0002',
    FirstName: 'Jane',
    LastName: 'Smith',
    Email: 'jane.smith@example.com',
    Phone: '555-234-5678',
    Address: '456 Oak Ave',
    City: 'Los Angeles',
    State: 'CA',
    PostalCode: '90001',
    Country: 'USA'
  },
  {
    CustomerID: 'C0003',
    FirstName: 'Robert',
    LastName: 'Johnson',
    Email: 'robert.j@example.com',
    Phone: '555-345-6789',
    Address: '789 Pine Rd',
    City: 'Chicago',
    State: 'IL',
    PostalCode: '60601',
    Country: 'USA'
  }
];

const mockProducts: Product[] = [
  {
    ProductID: 'P0001',
    ProductName: 'Laptop Pro',
    Description: 'High-performance laptop with 16GB RAM',
    Category: 'Electronics',
    Price: 1299.99,
    StockQuantity: 50
  },
  {
    ProductID: 'P0002',
    ProductName: 'Smartphone X',
    Description: 'Latest smartphone with advanced camera',
    Category: 'Electronics',
    Price: 899.99,
    StockQuantity: 100
  },
  {
    ProductID: 'P0003',
    ProductName: 'Wireless Headphones',
    Description: 'Noise-cancelling wireless headphones',
    Category: 'Electronics',
    Price: 199.99,
    StockQuantity: 200
  }
];

const mockOrders: Order[] = [
  {
    OrderID: '1',
    CustomerID: 'C0001',
    OrderDate: '2023-05-01T10:30:00Z',
    Status: 'Completed',
    TotalAmount: 1299.99,
    ProductID: 'P0001',
    ProductName: 'Laptop Pro',
    Quantity: 1,
    UnitPrice: 1299.99
  },
  {
    OrderID: '2',
    CustomerID: 'C0002',
    OrderDate: '2023-05-02T14:45:00Z',
    Status: 'Shipped',
    TotalAmount: 1099.98,
    ProductID: 'P0003',
    ProductName: 'Wireless Headphones',
    Quantity: 1,
    UnitPrice: 199.99
  }
];

class MockApiServiceClass {
  /**
   * Get all customers or a specific customer by ID
   */
  async getCustomers(customerId?: string): Promise<Customer[]> {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (customerId) {
      const customer = mockCustomers.find(c => c.CustomerID === customerId);
      return customer ? [customer] : [];
    }
    
    return [...mockCustomers];
  }

  /**
   * Get all products or a specific product by ID
   */
  async getProducts(productId?: string): Promise<Product[]> {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (productId) {
      const product = mockProducts.find(p => p.ProductID === productId);
      return product ? [product] : [];
    }
    
    return [...mockProducts];
  }

  /**
   * Get orders filtered by customer ID and/or product ID
   */
  async getOrders(customerId?: string, productId?: string): Promise<Order[]> {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredOrders = [...mockOrders];
    
    if (customerId) {
      filteredOrders = filteredOrders.filter(o => o.CustomerID === customerId);
    }
    
    if (productId) {
      filteredOrders = filteredOrders.filter(o => o.ProductID === productId);
    }
    
    return filteredOrders;
  }

  /**
   * Create a new order for a customer and product
   */
  async createOrder(customerId: string, productId: string): Promise<any> {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const customer = mockCustomers.find(c => c.CustomerID === customerId);
    const product = mockProducts.find(p => p.ProductID === productId);
    
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    // Create a new order
    const newOrder: Order = {
      OrderID: (mockOrders.length + 1).toString(),
      CustomerID: customerId,
      OrderDate: new Date().toISOString(),
      Status: 'Pending',
      TotalAmount: product.Price,
      ProductID: productId,
      ProductName: product.ProductName,
      Quantity: 1,
      UnitPrice: product.Price
    };
    
    // In a real application, we would save this to the database
    mockOrders.push(newOrder);
    
    return {
      success: true,
      message: `Order created successfully with ID: ${newOrder.OrderID}`,
      orderId: newOrder.OrderID
    };
  }
}

// Export a singleton instance that can be used for development
export const MockApiService = new MockApiServiceClass();
