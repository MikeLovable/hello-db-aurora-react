import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { Product } from '@/types';
import { Table, Input, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

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
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchInput, setSearchInput] = useState<Input | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (selectedKeys: string[], confirm: (param?: any) => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): ColumnsType<DataType>[0] => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            setSearchInput(node);
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible && searchInput) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Product ID',
      dataIndex: 'productID',
      key: 'productID',
      ...getColumnSearchProps('productID'),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      ...getColumnSearchProps('productName'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        ...new Set(products.map(product => product.Category)).values()
      ].map(category => ({
        text: category,
        value: category,
      })),
      onFilter: (value: string, record: Product) => record.Category === value,
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
      sorter: (a: Product, b: Product) => a.Price - b.Price,
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'StockQuantity',
      key: 'StockQuantity',
      sorter: (a: Product, b: Product) => a.StockQuantity - b.StockQuantity,
    },
  ];

  const data: DataType[] = products.map(product => ({
    key: product.ProductID,
    productID: product.ProductID,
    productName: product.ProductName,
    description: product.Description,
    category: product.Category,
    Price: product.Price,
    stockQuantity: product.StockQuantity,
  }));

  return (
    <Table<DataType>
      columns={columns}
      dataSource={data}
      loading={loading}
    />
  );
};

export default ProductTab;
