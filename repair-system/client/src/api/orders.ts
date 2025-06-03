import api from './api';
import { CustomerType, OrderType, OrderItemType } from './customers';
import { UserType } from './users';

// Description: Create a new order
// Endpoint: POST /api/orders
// Request: { order: Partial<OrderType> }
// Response: { order: OrderType }
export const createOrder = (order: Partial<OrderType>) => {
  // Mocking the response
  return new Promise<{ order: OrderType }>((resolve) => {
    setTimeout(() => {
      const newOrder: OrderType = {
        _id: `order_${Math.random().toString(36).substring(2, 9)}`,
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: order.customerId || '',
        items: order.items || [],
        status: 'pending',
        totalAmount: order.totalAmount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchId: order.branchId || 'branch_main',
        createdBy: order.createdBy || 'user_admin',
        notes: order.notes,
        deviceLeft: order.deviceLeft || false,
        sentToCentralService: order.sentToCentralService || false,
        barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
      };
      mockOrders.push(newOrder);
      resolve({ order: newOrder });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/orders', { order });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update an existing order
// Endpoint: PUT /api/orders/{orderId}
// Request: { order: Partial<OrderType> }
// Response: { order: OrderType }
export const updateOrder = (orderId: string, orderData: Partial<OrderType>) => {
  // Mocking the response
  return new Promise<{ order: OrderType }>((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(o => o._id === orderId);
      if (orderIndex === -1) {
        reject(new Error('Order not found'));
        return;
      }

      const updatedOrder = {
        ...mockOrders[orderIndex],
        ...orderData,
        updatedAt: new Date().toISOString()
      };

      mockOrders[orderIndex] = updatedOrder;
      resolve({ order: updatedOrder });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/orders/${orderId}`, { order: orderData });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get order details
// Endpoint: GET /api/orders/{orderId}
// Request: { orderId: string }
// Response: { order: OrderType }
export const getOrderDetails = (orderId: string) => {
  // Mocking the response
  return new Promise<{ order: OrderType }>((resolve, reject) => {
    setTimeout(() => {
      // Add the specific order_789 that's causing the error
      if (orderId === 'order_789') {
        resolve({
          order: {
            _id: 'order_789',
            orderNumber: 'ORD-003',
            customerId: 'cust_789012',
            items: [
              {
                _id: 'item_3',
                brand: 'Dell',
                model: 'XPS 15',
                parts: [
                  {
                    _id: 'part_4',
                    name: 'Keyboard Replacement',
                    price: 90,
                    quantity: 1
                  },
                  {
                    _id: 'part_5',
                    name: 'SSD 512GB',
                    price: 150,
                    quantity: 1
                  }
                ],
                totalPrice: 240
              }
            ],
            status: 'in_process',
            totalAmount: 240,
            createdAt: '2023-05-15T11:30:00.000Z',
            updatedAt: '2023-05-16T09:20:00.000Z',
            branchId: 'branch_main',
            createdBy: 'user_tech1',
            deviceLeft: true,
            sentToCentralService: false,
            barcode: '345678901234'
          }
        });
        return;
      }

      const order = mockOrders.find(o => o._id === orderId);
      if (!order) {
        reject(new Error('Order not found'));
        return;
      }
      resolve({ order });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/${orderId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get all orders (with optional branch filter)
// Endpoint: GET /api/orders?branchId={branchId}
// Request: { branchId?: string }
// Response: { orders: OrderType[] }
export const getOrders = (filters: { branchId?: string } = {}) => {
  // Mocking the response
  return new Promise<{ orders: OrderType[] }>((resolve) => {
    setTimeout(() => {
      let filteredOrders = [...mockOrders];

      // Filter by branchId if provided
      if (filters.branchId) {
        filteredOrders = filteredOrders.filter(o => o.branchId === filters.branchId);
      }

      resolve({ orders: filteredOrders });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const queryParams = new URLSearchParams();
  //   if (filters.branchId) queryParams.append('branchId', filters.branchId);
  //
  //   return await api.get(`/api/orders?${queryParams}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get orders by barcode
// Endpoint: GET /api/orders/barcode/{barcode}
// Request: { barcode: string }
// Response: { orders: OrderType[] }
export const getOrdersByBarcode = (barcode: string) => {
  // Mocking the response
  return new Promise<{ orders: OrderType[] }>((resolve) => {
    setTimeout(() => {
      const orders = mockOrders.filter(o =>
        o.barcode === barcode || o.orderNumber === barcode
      );
      resolve({ orders });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/barcode/${barcode}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Search orders by various fields
// Endpoint: GET /api/orders/search?query={query}
// Request: { query: string }
// Response: { orders: OrderType[] }
export const searchOrders = (query: string) => {
  // Mocking the response
  return new Promise<{ orders: OrderType[] }>((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve({ orders: mockOrders });
        return;
      }

      const lowerQuery = query.toLowerCase();
      const orders = mockOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.barcode?.toLowerCase().includes(lowerQuery) ||
        order.status.toLowerCase().includes(lowerQuery) ||
        order.customerId.toLowerCase().includes(lowerQuery) ||
        order.items.some(item =>
          item.brand.toLowerCase().includes(lowerQuery) ||
          item.model.toLowerCase().includes(lowerQuery) ||
          item.parts.some(part => part.name.toLowerCase().includes(lowerQuery))
        ) ||
        (order.notes && order.notes.toLowerCase().includes(lowerQuery))
      );

      resolve({ orders });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/search?query=${encodeURIComponent(query)}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get branch orders
// Endpoint: GET /api/orders?branchId={branchId}
// Request: { branchId: string }
// Response: { orders: OrderType[] }
export const getBranchOrders = (branchId: string) => {
  // Mocking the response
  return new Promise<{ orders: OrderType[] }>((resolve) => {
    setTimeout(() => {
      const filteredOrders = mockOrders.filter(order => order.branchId === branchId);
      resolve({ orders: filteredOrders });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders?branchId=${branchId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Mock data
const mockOrders: OrderType[] = [
  {
    _id: 'order_123',
    orderNumber: 'ORD-001',
    customerId: 'cust_123456',
    items: [
      {
        _id: 'item_1',
        brand: 'Apple',
        model: 'iPhone 12',
        parts: [
          {
            _id: 'part_1',
            name: 'Screen Replacement',
            price: 150,
            quantity: 1
          },
          {
            _id: 'part_2',
            name: 'Battery',
            price: 80,
            quantity: 1
          }
        ],
        totalPrice: 230
      }
    ],
    status: 'completed',
    totalAmount: 230,
    createdAt: '2023-04-15T10:30:00.000Z',
    updatedAt: '2023-04-18T14:45:00.000Z',
    branchId: 'branch_main',
    createdBy: 'user_staff1',
    notes: 'Customer reported phone not charging properly',
    deviceLeft: true,
    sentToCentralService: false,
    barcode: '123456789012'
  },
  {
    _id: 'order_456',
    orderNumber: 'ORD-002',
    customerId: 'cust_123456',
    items: [
      {
        _id: 'item_2',
        brand: 'Samsung',
        model: 'Galaxy S21',
        parts: [
          {
            _id: 'part_3',
            name: 'Camera Module',
            price: 120,
            quantity: 1
          }
        ],
        totalPrice: 120
      }
    ],
    status: 'pending',
    totalAmount: 120,
    createdAt: '2023-05-10T09:15:00.000Z',
    updatedAt: '2023-05-10T09:15:00.000Z',
    branchId: 'branch_main',
    createdBy: 'user_staff2',
    deviceLeft: false,
    sentToCentralService: true,
    barcode: '234567890123'
  },
  {
    _id: 'order_789',
    orderNumber: 'ORD-003',
    customerId: 'cust_789012',
    items: [
      {
        _id: 'item_3',
        brand: 'Dell',
        model: 'XPS 15',
        parts: [
          {
            _id: 'part_4',
            name: 'Keyboard Replacement',
            price: 90,
            quantity: 1
          },
          {
            _id: 'part_5',
            name: 'SSD 512GB',
            price: 150,
            quantity: 1
          }
        ],
        totalPrice: 240
      }
    ],
    status: 'in_process',
    totalAmount: 240,
    createdAt: '2023-05-15T11:30:00.000Z',
    updatedAt: '2023-05-16T09:20:00.000Z',
    branchId: 'branch_north',
    createdBy: 'user_tech1',
    deviceLeft: true,
    sentToCentralService: false,
    barcode: '345678901234'
  }
];