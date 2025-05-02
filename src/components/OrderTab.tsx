
import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { Customer, Product, Order } from '@/types';
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
import { ShoppingCart, Search } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const OrderTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

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

    const fetchOrders = async () => {
      try {
        const data = await ApiService.getOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err: any) {
        setError(`Failed to fetch orders: ${err.message}`);
        toast.error(`Failed to fetch orders: ${err.message}`);
      }
    };

    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, []);

  // Filter orders when searchText changes
  useEffect(() => {
    if (!searchText) {
      setFilteredOrders(orders);
    } else {
      const lowercasedFilter = searchText.toLowerCase();
      const filtered = orders.filter(item => {
        return (
          item.OrderID.toLowerCase().includes(lowercasedFilter) ||
          item.CustomerID.toLowerCase().includes(lowercasedFilter) ||
          (item.ProductName && item.ProductName.toLowerCase().includes(lowercasedFilter))
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchText, orders]);

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
      
      // Refresh orders list after creating a new order
      const updatedOrders = await ApiService.getOrders();
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="space-y-8">
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

      {/* Orders List Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Orders List</h2>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            value={searchText}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.OrderID}>
                    <TableCell>{order.OrderID}</TableCell>
                    <TableCell>{order.FirstName} {order.LastName}</TableCell>
                    <TableCell>{order.ProductName}</TableCell>
                    <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{order.Status}</TableCell>
                    <TableCell>${order.TotalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">No orders found.</div>
        )}
      </div>
    </div>
  );
};

export default OrderTab;
