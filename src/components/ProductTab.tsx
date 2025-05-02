
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import apiService, { Product, ApiResponse } from "../services/ApiService";
import { toast } from "sonner";

/**
 * Product Tab Component
 * Allows viewing and searching for products
 */
const ProductTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Load product data on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from API
  const fetchProducts = async (productID?: string) => {
    setLoading(true);
    try {
      const response: ApiResponse<Product> = await apiService.getProducts(
        productID
      );

      if (response.error) {
        toast.error("Failed to load products", {
          description: response.error,
        });
      } else {
        setProducts(response.data);
        if (response.data.length === 0) {
          toast.info("No products found");
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  };

  // Reset search and show all products
  const handleReset = () => {
    setSearchTerm("");
    fetchProducts();
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Browse and search for products in the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Product ID (e.g., P0001)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        </form>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.ProductID}>
                    <TableCell className="font-medium">
                      {product.ProductID}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.ProductName}</div>
                        <div className="text-sm text-gray-500">
                          {product.Description.length > 60
                            ? product.Description.substring(0, 60) + "..."
                            : product.Description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.Category}</TableCell>
                    <TableCell>{formatPrice(product.Price)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          product.StockQuantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.StockQuantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.StockQuantity} in stock
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
  );
};

export default ProductTab;
