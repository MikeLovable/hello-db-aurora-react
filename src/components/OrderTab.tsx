
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiService, {
  Customer,
  Product,
  Order,
  ApiResponse,
} from "../services/ApiService";
import { toast } from "sonner";

/**
 * Order Tab Component
 * Allows viewing orders and creating new orders
 */
const OrderTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [loading, setLoading] = useState({
    customers: false,
    products: false,
    orders: false,
    transaction: false,
  });

  // Load data on initial render
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const response: ApiResponse<Customer> = await apiService.getCustomers();
      if (!response.error) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const response: ApiResponse<Product> = await apiService.getProducts();
      if (!response.error) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // Fetch orders from API
  const fetchOrders = async (customerID?: string, productID?: string) => {
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
      const response: ApiResponse<Order> = await apiService.getOrders(
        customerID,
        productID
      );
      
      if (response.error) {
        toast.error("Failed to load orders", {
          description: response.error,
        });
      } else {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  // Handle order transaction
  const handleTransactOrder = async () => {
    if (!selectedCustomer || !selectedProduct) {
      toast.warning("Please select both a customer and a product");
      return;
    }

    setLoading((prev) => ({ ...prev, transaction: true }));
    try {
      const response = await apiService.transactOrder(
        selectedCustomer,
        selectedProduct
      );

      if (response.success) {
        toast.success("Order created successfully", {
          description: `Order ID: ${response.orderId}`,
        });
        // Refresh orders after successful transaction
        fetchOrders();
      } else {
        toast.error("Failed to create order", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setLoading((prev) => ({ ...prev, transaction: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transact Order</CardTitle>
          <CardDescription>
            Create a new order by selecting a customer and a product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label htmlFor="customer-select" className="text-sm font-medium">
                Select Customer
              </label>
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
                disabled={loading.customers || loading.transaction}
              >
                <SelectTrigger id="customer-select">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.CustomerID}
                      value={customer.CustomerID}
                    >
                      {customer.CustomerID} - {customer.FirstName}{" "}
                      {customer.LastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-select" className="text-sm font-medium">
                Select Product
              </label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={loading.products || loading.transaction}
              >
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.ProductID}
                      value={product.ProductID}
                    >
                      {product.ProductID} - {product.ProductName} (
                      {formatPrice(product.Price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleTransactOrder}
            disabled={
              !selectedCustomer ||
              !selectedProduct ||
              loading.transaction
            }
          >
            {loading.transaction
              ? "Processing Order..."
              : "Complete Transaction"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View all orders in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.orders ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.OrderID}>
                      <TableCell className="font-medium">
                        {order.OrderID}
                      </TableCell>
                      <TableCell>
                        {order.CustomerID} - {order.FirstName} {order.LastName}
                      </TableCell>
                      <TableCell>
                        {order.ProductID} - {order.ProductName}
                      </TableCell>
                      <TableCell>{formatDate(order.OrderDate)}</TableCell>
                      <TableCell>{formatPrice(order.TotalAmount)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.Status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.Status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.Status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.Status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTab;
