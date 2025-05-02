
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CustomerTab from '@/components/CustomerTab';
import ProductTab from '@/components/ProductTab';
import OrderTab from '@/components/OrderTab';

const Index: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">HelloDB Management System</h1>
      <Tabs defaultValue="customers">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <CustomerTab />
        </TabsContent>
        <TabsContent value="products">
          <ProductTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
