
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomerTab from "./components/CustomerTab";
import ProductTab from "./components/ProductTab";
import OrderTab from "./components/OrderTab";
import Navbar from "./components/Navbar";

/**
 * Main Application Component
 * Provides the tabbed interface for the HelloDB application
 */
const App = () => {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">HelloDB</h1>
            <p className="text-slate-600 mt-2">
              A two-tier web application with React frontend and AWS backend
            </p>
          </div>
          
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
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
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

export default App;
