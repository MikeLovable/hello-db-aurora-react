
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
import apiService, { Customer, ApiResponse } from "../services/ApiService";
import { toast } from "sonner";

/**
 * Customer Tab Component
 * Allows viewing and searching for customers
 */
const CustomerTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Load customer data on initial render
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async (customerID?: string) => {
    setLoading(true);
    try {
      const response: ApiResponse<Customer> = await apiService.getCustomers(customerID);
      
      if (response.error) {
        toast.error("Failed to load customers", {
          description: response.error,
        });
      } else {
        setCustomers(response.data);
        if (response.data.length === 0) {
          toast.info("No customers found");
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchCustomers(searchTerm);
    } else {
      fetchCustomers();
    }
  };

  // Reset search and show all customers
  const handleReset = () => {
    setSearchTerm("");
    fetchCustomers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          Browse and search for customers in the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by Customer ID (e.g., C0001)"
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
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.CustomerID}>
                    <TableCell className="font-medium">
                      {customer.CustomerID}
                    </TableCell>
                    <TableCell>
                      {customer.FirstName} {customer.LastName}
                    </TableCell>
                    <TableCell>{customer.Email}</TableCell>
                    <TableCell>{customer.Phone}</TableCell>
                    <TableCell>
                      {customer.City}, {customer.State}
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

export default CustomerTab;
