import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { Customer } from '@/types/Customer';
import { Product } from '@/types/Product';
import styles from './OrderTab.module.css';

const OrderTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await ApiService.getCustomers();
        setCustomers(data);
      } catch (err: any) {
        setError(`Failed to fetch customers: ${err.message}`);
      }
    };

    const fetchProducts = async () => {
      try {
        const data = await ApiService.getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(`Failed to fetch products: ${err.message}`);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  const handleCustomerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(event.target.value);
  };

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(event.target.value);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer || !selectedProduct) {
      setError('Please select a customer and a product.');
      return;
    }

    try {
      const result = await ApiService.createOrder(selectedCustomer, selectedProduct);
      setOrderResult(result);
      setError('');
    } catch (err: any) {
      setError(`Failed to create order: ${err.message}`);
    }
  };

  return (
    <div className={styles.orderTab}>
      <h2>Create New Order</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="customer">Customer:</label>
        <select id="customer" value={selectedCustomer} onChange={handleCustomerChange}>
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.CustomerID} value={customer.CustomerID}>
              {customer.FirstName} {customer.LastName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="product">Product:</label>
        <select id="product" value={selectedProduct} onChange={handleProductChange}>
          <option value="">Select a product</option>
          {products.map(product => (
            <option key={product.ProductID} value={product.ProductID}>
              {product.ProductName}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleCreateOrder} className={styles.createOrderButton}>
        Create Order
      </button>

      {orderResult && (
        <div className={styles.orderResult}>
          <h3>Order Result:</h3>
          <p>{orderResult.message}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTab;
