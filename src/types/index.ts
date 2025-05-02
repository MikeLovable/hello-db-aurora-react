
export interface Customer {
  CustomerID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  Address?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  CreatedAt?: string;
}

export interface Product {
  ProductID: string;
  ProductName: string;
  Description?: string;
  Category?: string;
  Price: number;
  StockQuantity: number;
  CreatedAt?: string;
}

export interface Order {
  OrderID: string;
  CustomerID: string;
  FirstName?: string;
  LastName?: string;
  OrderDate: string;
  Status?: string;
  TotalAmount: number;
  ProductID?: string;
  ProductName?: string;
  Quantity?: number;
  UnitPrice?: number;
}
