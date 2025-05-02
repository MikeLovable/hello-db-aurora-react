
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { Customer } from '../types';
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
import { Search } from "lucide-react";

const CustomerTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const fetchedCustomers = searchId
        ? await ApiService.getCustomers(searchId)
        : await ApiService.getCustomers();
      setCustomers(fetchedCustomers);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchId(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Customers</h2>
      
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by Customer ID"
            value={searchId}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      {error && <div className="p-4 text-white bg-red-500 rounded">{error}</div>}
      
      {loading ? (
        <div className="text-center py-8">Loading customers...</div>
      ) : customers.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Postal Code</TableHead>
                <TableHead>Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.CustomerID}>
                  <TableCell>{customer.CustomerID}</TableCell>
                  <TableCell>{customer.FirstName}</TableCell>
                  <TableCell>{customer.LastName}</TableCell>
                  <TableCell>{customer.Email}</TableCell>
                  <TableCell>{customer.Phone}</TableCell>
                  <TableCell>{customer.Address}</TableCell>
                  <TableCell>{customer.City}</TableCell>
                  <TableCell>{customer.State}</TableCell>
                  <TableCell>{customer.PostalCode}</TableCell>
                  <TableCell>{customer.Country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">No customers found.</div>
      )}
    </div>
  );
};

export default CustomerTab;
