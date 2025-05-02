
import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { Product } from '@/types';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataType {
  key: string;
  productID: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
}

const ProductTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when searchText changes
  useEffect(() => {
    if (!searchText) {
      setFilteredProducts(products);
    } else {
      const lowercasedFilter = searchText.toLowerCase();
      const filtered = products.filter(item => {
        return (
          item.ProductID.toLowerCase().includes(lowercasedFilter) ||
          item.ProductName.toLowerCase().includes(lowercasedFilter) ||
          (item.Category && item.Category.toLowerCase().includes(lowercasedFilter)) ||
          (item.Description && item.Description.toLowerCase().includes(lowercasedFilter))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchText, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search products..."
          value={searchText}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.ProductID}>
                  <TableCell>{product.ProductID}</TableCell>
                  <TableCell>{product.ProductName}</TableCell>
                  <TableCell>{product.Description}</TableCell>
                  <TableCell>{product.Category}</TableCell>
                  <TableCell>${product.Price.toFixed(2)}</TableCell>
                  <TableCell>{product.StockQuantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">No products found.</div>
      )}
    </div>
  );
};

export default ProductTab;
