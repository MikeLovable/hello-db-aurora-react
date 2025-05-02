
import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { Customer, Product } from '@/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const OrderTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await ApiService.getCustomers();
        setCustomers(data);
      } catch (err: any) {
        setError(`Failed to fetch customers: ${err.message}`);
        toast.error(`Failed to fetch customers: ${err.message}`);
      }
    };

    const fetchProducts = async () => {
      try {
        const data = await ApiService.getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(`Failed to fetch products: ${err.message}`);
        toast.error(`Failed to fetch products: ${err.message}`);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  const handleCustomerChange = (value: string) => {
    setSelectedCustomer(value);
  };

  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer || !selectedProduct) {
      setError('Please select a customer and a product.');
      toast.error('Please select a customer and a product.');
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.createOrder(selectedCustomer, selectedProduct);
      setOrderResult(result);
      setError('');
      toast.success('Order created successfully!');
    } catch (err: any) {
      setError(`Failed to create order: ${err.message}`);
      toast.error(`Failed to create order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.CustomerID === id);
    return customer ? `${customer.FirstName} ${customer.LastName}` : '';
  };

  const getProductName = (id: string) => {
    const product = products.find(p => p.ProductID === id);
    return product ? product.ProductName : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Select a customer and product to create a new order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-4 text-white bg-red-500 rounded">{error}</div>}

        <div className="space-y-2">
          <label htmlFor="customer" className="block text-sm font-medium">Customer:</label>
          <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
            <SelectTrigger id="customer" className="w-full">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.CustomerID} value={customer.CustomerID}>
                  {customer.FirstName} {customer.LastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="product" className="block text-sm font-medium">Product:</label>
          <Select value={selectedProduct} onValueChange={handleProductChange}>
            <SelectTrigger id="product" className="w-full">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.ProductID} value={product.ProductID}>
                  {product.ProductName} (${product.Price.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleCreateOrder} 
          className="w-full" 
          disabled={!selectedCustomer || !selectedProduct || loading}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>

        {orderResult && (
          <Card className="mt-4 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Order Confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Status:</strong> {orderResult.success ? 'Success' : 'Failed'}</p>
              <p><strong>Message:</strong> {orderResult.message}</p>
              {selectedCustomer && <p><strong>Customer:</strong> {getCustomerName(selectedCustomer)}</p>}
              {selectedProduct && <p><strong>Product:</strong> {getProductName(selectedProduct)}</p>}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTab;
