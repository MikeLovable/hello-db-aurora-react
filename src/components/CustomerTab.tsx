import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { Customer } from '../types';

const CustomerTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const fetchedCustomers = searchId
        ? await ApiService.getCustomers(searchId)
        : await ApiService.getCustomers();
      setCustomers(fetchedCustomers);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch customers');
      setCustomers([]);
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
    <div className="customer-tab">
      <h2>Customers</h2>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by Customer ID"
          value={searchId}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      {customers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Postal Code</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.CustomerID}>
                <td>{customer.CustomerID}</td>
                <td>{customer.FirstName}</td>
                <td>{customer.LastName}</td>
                <td>{customer.Email}</td>
                <td>{customer.Phone}</td>
                <td>{customer.Address}</td>
                <td>{customer.City}</td>
                <td>{customer.State}</td>
                <td>{customer.PostalCode}</td>
                <td>{customer.Country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No customers found.</div>
      )}
    </div>
  );
};

export default CustomerTab;
