import api from './api';

// Description: Search for customers by any field
// Endpoint: GET /api/customers/search?query={query}&page={page}&limit={limit}
// Request: { query: string, page: number, limit: number }
// Response: { customers: CustomerType[], totalCount: number, totalPages: number, currentPage: number }
export const searchCustomers = (query: string, page: number = 1, limit: number = 10) => {
  // Mocking the response
  return new Promise<{ customers: CustomerType[], totalCount: number, totalPages: number, currentPage: number }>((resolve) => {
    setTimeout(() => {
      const filteredCustomers = mockCustomers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phoneNumber.includes(query) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(query.toLowerCase()))
      );

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredCustomers.length / limit);

      resolve({
        customers: paginatedCustomers,
        totalCount: filteredCustomers.length,
        totalPages: totalPages,
        currentPage: page
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/customers/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Search for customer by phone number
// Endpoint: GET /api/customers/phone?phone={phone}
// Request: { phone: string }
// Response: { customer: CustomerType | null }
export const searchCustomerByPhone = (phone: string) => {
  // Mocking the response
  return new Promise<{ customer: CustomerType | null }>((resolve) => {
    setTimeout(() => {
      const customer = mockCustomers.find(c => c.phoneNumber === phone) || null;
      resolve({ customer });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/customers/phone?phone=${phone}`);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create or update a customer
// Endpoint: POST /api/customers
// Request: { customer: CustomerType }
// Response: { customer: CustomerType, isNew: boolean }
export const createOrUpdateCustomer = (customer: CustomerType) => {
  // Mocking the response
  return new Promise<{ customer: CustomerType, isNew: boolean }>((resolve) => {
    setTimeout(() => {
      let isNew = true;
      let updatedCustomer: CustomerType;

      if (customer._id) {
        // Update existing customer
        isNew = false;
        const index = mockCustomers.findIndex(c => c._id === customer._id);
        if (index !== -1) {
          mockCustomers[index] = {
            ...customer,
            updatedAt: new Date().toISOString()
          };
          updatedCustomer = mockCustomers[index];
        } else {
          updatedCustomer = {
            ...customer,
            _id: customer._id,
            updatedAt: new Date().toISOString()
          };
          mockCustomers.push(updatedCustomer);
        }
      } else {
        // Create new customer
        updatedCustomer = {
          ...customer,
          _id: `cust_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockCustomers.push(updatedCustomer);
      }

      resolve({ customer: updatedCustomer, isNew });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/customers', { customer });
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get customer orders history
// Endpoint: GET /api/customers/{customerId}/orders
// Request: { customerId: string }
// Response: { orders: OrderType[] }
export const getCustomerOrders = (customerId: string) => {
  // Mocking the response
  return new Promise<{ orders: OrderType[] }>((resolve) => {
    setTimeout(() => {
      const orders = mockOrders.filter(order => order.customerId === customerId);
      resolve({ orders });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/customers/${customerId}/orders`);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get all customers
// Endpoint: GET /api/customers?page={page}&limit={limit}
// Request: { page?: number, limit?: number }
// Response: { customers: CustomerType[], totalCount: number, totalPages: number, currentPage: number }
export const getAllCustomers = (page: number = 1, limit: number = 20) => {
  // Mocking the response
  return new Promise<{ customers: CustomerType[], totalCount: number, totalPages: number, currentPage: number }>((resolve) => {
    setTimeout(() => {
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedCustomers = mockCustomers.slice(startIndex, endIndex);
      const totalPages = Math.ceil(mockCustomers.length / limit);

      resolve({
        customers: paginatedCustomers,
        totalCount: mockCustomers.length,
        totalPages: totalPages,
        currentPage: page
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/customers?page=${page}&limit=${limit}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type CustomerType = {
  _id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  address?: string;
  contactPreference: 'sms' | 'email' | 'whatsapp';
  createdAt?: string;
  updatedAt?: string;
  branchId: string;
};

export type OrderType = {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItemType[];
  status: 'pending' | 'in_process' | 'shipped' | 'completed' | 'closed';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  branchId: string;
  createdBy: string;
  notes?: string;
  barcode?: string;
  deviceLeft?: boolean;
  sentToCentralService?: boolean;
};

export type OrderItemType = {
  _id: string;
  brand: string;
  model: string;
  parts: OrderPartType[];
  totalPrice: number;
};

export type OrderPartType = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
};

// Mock data
const mockCustomers: CustomerType[] = [
  {
    _id: 'cust_123456',
    name: 'John Doe',
    phoneNumber: '1234567890',
    email: 'john@example.com',
    address: '123 Main St, City',
    contactPreference: 'email',
    createdAt: '2023-01-15T10:30:00.000Z',
    updatedAt: '2023-04-20T14:45:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_789012',
    name: 'Jane Smith',
    phoneNumber: '9876543210',
    email: 'jane@example.com',
    address: '456 Oak Ave, Town',
    contactPreference: 'sms',
    createdAt: '2023-02-10T09:15:00.000Z',
    updatedAt: '2023-05-05T11:20:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_345678',
    name: 'Robert Johnson',
    phoneNumber: '5551234567',
    email: 'robert@example.com',
    address: '789 Pine St, Village',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-20T14:30:00.000Z',
    updatedAt: '2023-05-10T09:45:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_901234',
    name: 'Sarah Williams',
    phoneNumber: '7778889999',
    email: 'sarah@example.com',
    address: '101 Maple Ave, County',
    contactPreference: 'email',
    createdAt: '2023-01-25T11:20:00.000Z',
    updatedAt: '2023-04-15T10:30:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_567890',
    name: 'Michael Brown',
    phoneNumber: '3334445555',
    email: 'michael@example.com',
    address: '202 Cedar St, Borough',
    contactPreference: 'sms',
    createdAt: '2023-02-05T16:40:00.000Z',
    updatedAt: '2023-05-01T13:15:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_111222',
    name: 'Emma Davis',
    phoneNumber: '1112223333',
    email: 'emma@example.com',
    address: '303 Birch Ave, Township',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-10T09:30:00.000Z',
    updatedAt: '2023-04-25T14:20:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_333444',
    name: 'James Wilson',
    phoneNumber: '4445556666',
    email: 'james@example.com',
    address: '404 Elm St, District',
    contactPreference: 'email',
    createdAt: '2023-01-05T13:45:00.000Z',
    updatedAt: '2023-05-15T11:10:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_555666',
    name: 'Olivia Martinez',
    phoneNumber: '6667778888',
    email: 'olivia@example.com',
    address: '505 Spruce Ave, Suburb',
    contactPreference: 'sms',
    createdAt: '2023-02-15T10:20:00.000Z',
    updatedAt: '2023-04-10T15:30:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_777888',
    name: 'William Taylor',
    phoneNumber: '8889990000',
    email: 'william@example.com',
    address: '606 Redwood St, Hamlet',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-01T15:15:00.000Z',
    updatedAt: '2023-05-20T09:40:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_999000',
    name: 'Sophia Anderson',
    phoneNumber: '2223334444',
    email: 'sophia@example.com',
    address: '707 Sequoia Ave, Metropolis',
    contactPreference: 'email',
    createdAt: '2023-01-30T08:50:00.000Z',
    updatedAt: '2023-04-05T16:25:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_121212',
    name: 'Liam Thomas',
    phoneNumber: '9990001111',
    email: 'liam@example.com',
    address: '808 Aspen St, Downtown',
    contactPreference: 'sms',
    createdAt: '2023-02-20T12:10:00.000Z',
    updatedAt: '2023-05-12T10:55:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_232323',
    name: 'Ava Garcia',
    phoneNumber: '1231231234',
    email: 'ava@example.com',
    address: '909 Pine Ave, Uptown',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-15T11:40:00.000Z',
    updatedAt: '2023-04-30T13:05:00.000Z',
    branchId: 'branch_main'
  },
  // Adding more mock customers to test pagination
  {
    _id: 'cust_343434',
    name: 'Noah Rodriguez',
    phoneNumber: '2342342345',
    email: 'noah@example.com',
    address: '101 Oak St, Eastside',
    contactPreference: 'email',
    createdAt: '2023-01-10T08:30:00.000Z',
    updatedAt: '2023-04-22T15:20:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_454545',
    name: 'Isabella Lopez',
    phoneNumber: '3453453456',
    email: 'isabella@example.com',
    address: '202 Maple Dr, Westside',
    contactPreference: 'sms',
    createdAt: '2023-02-12T09:45:00.000Z',
    updatedAt: '2023-05-03T12:30:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_565656',
    name: 'Mason Gonzalez',
    phoneNumber: '4564564567',
    email: 'mason@example.com',
    address: '303 Pine Rd, Northside',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-05T14:20:00.000Z',
    updatedAt: '2023-04-28T10:15:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_676767',
    name: 'Charlotte Perez',
    phoneNumber: '5675675678',
    email: 'charlotte@example.com',
    address: '404 Cedar Ln, Southside',
    contactPreference: 'email',
    createdAt: '2023-01-20T10:10:00.000Z',
    updatedAt: '2023-04-12T16:45:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_787878',
    name: 'Elijah Sanchez',
    phoneNumber: '6786786789',
    email: 'elijah@example.com',
    address: '505 Birch Blvd, Easttown',
    contactPreference: 'sms',
    createdAt: '2023-02-25T11:30:00.000Z',
    updatedAt: '2023-05-08T09:50:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_898989',
    name: 'Amelia Ramirez',
    phoneNumber: '7897897890',
    email: 'amelia@example.com',
    address: '606 Elm Ct, Westtown',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-18T13:15:00.000Z',
    updatedAt: '2023-05-18T11:40:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_909090',
    name: 'Oliver Torres',
    phoneNumber: '8908908901',
    email: 'oliver@example.com',
    address: '707 Spruce Pl, Northtown',
    contactPreference: 'email',
    createdAt: '2023-01-08T09:20:00.000Z',
    updatedAt: '2023-04-18T14:10:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_010101',
    name: 'Mia Flores',
    phoneNumber: '9019019012',
    email: 'mia@example.com',
    address: '808 Redwood Way, Southtown',
    contactPreference: 'sms',
    createdAt: '2023-02-18T15:25:00.000Z',
    updatedAt: '2023-05-02T10:35:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_121314',
    name: 'Ethan Rivera',
    phoneNumber: '1213141516',
    email: 'ethan@example.com',
    address: '909 Sequoia Dr, Uptown',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-12T12:40:00.000Z',
    updatedAt: '2023-04-27T15:55:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_151617',
    name: 'Abigail Collins',
    phoneNumber: '1516171819',
    email: 'abigail@example.com',
    address: '101 Aspen Ct, Downtown',
    contactPreference: 'email',
    createdAt: '2023-01-14T11:05:00.000Z',
    updatedAt: '2023-04-08T13:30:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_181920',
    name: 'Alexander Reyes',
    phoneNumber: '1819202122',
    email: 'alexander@example.com',
    address: '202 Pine Ln, Eastside',
    contactPreference: 'sms',
    createdAt: '2023-02-22T10:50:00.000Z',
    updatedAt: '2023-05-14T09:25:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_212223',
    name: 'Emily Cooper',
    phoneNumber: '2122232425',
    email: 'emily@example.com',
    address: '303 Oak Dr, Westside',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-25T14:55:00.000Z',
    updatedAt: '2023-05-22T12:15:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_242526',
    name: 'Daniel Morgan',
    phoneNumber: '2425262728',
    email: 'daniel@example.com',
    address: '404 Maple Rd, Northside',
    contactPreference: 'email',
    createdAt: '2023-01-23T13:10:00.000Z',
    updatedAt: '2023-04-14T16:05:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_272829',
    name: 'Sofia Brooks',
    phoneNumber: '2728293031',
    email: 'sofia@example.com',
    address: '505 Cedar Blvd, Southside',
    contactPreference: 'sms',
    createdAt: '2023-02-28T09:35:00.000Z',
    updatedAt: '2023-05-07T11:50:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_303132',
    name: 'Matthew Reed',
    phoneNumber: '3031323334',
    email: 'matthew@example.com',
    address: '606 Birch Way, Easttown',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-03T15:40:00.000Z',
    updatedAt: '2023-04-24T14:30:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_333435',
    name: 'Camila Kelly',
    phoneNumber: '3334353637',
    email: 'camila@example.com',
    address: '707 Elm Pl, Westtown',
    contactPreference: 'email',
    createdAt: '2023-01-16T10:15:00.000Z',
    updatedAt: '2023-04-03T12:55:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_363738',
    name: 'David Murphy',
    phoneNumber: '3637383940',
    email: 'david@example.com',
    address: '808 Spruce Dr, Northtown',
    contactPreference: 'sms',
    createdAt: '2023-02-08T12:25:00.000Z',
    updatedAt: '2023-05-16T15:40:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_394041',
    name: 'Victoria Cook',
    phoneNumber: '3940414243',
    email: 'victoria@example.com',
    address: '909 Redwood Ct, Southtown',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-28T11:35:00.000Z',
    updatedAt: '2023-05-24T10:20:00.000Z',
    branchId: 'branch_south'
  },
  {
    _id: 'cust_424344',
    name: 'Joseph Bailey',
    phoneNumber: '4243444546',
    email: 'joseph@example.com',
    address: '101 Sequoia Blvd, Uptown',
    contactPreference: 'email',
    createdAt: '2023-01-27T09:50:00.000Z',
    updatedAt: '2023-04-16T13:15:00.000Z',
    branchId: 'branch_main'
  },
  {
    _id: 'cust_454647',
    name: 'Gianna Rivera',
    phoneNumber: '4546474849',
    email: 'gianna@example.com',
    address: '202 Aspen Way, Downtown',
    contactPreference: 'sms',
    createdAt: '2023-02-03T14:05:00.000Z',
    updatedAt: '2023-05-09T16:30:00.000Z',
    branchId: 'branch_north'
  },
  {
    _id: 'cust_495051',
    name: 'Benjamin Cox',
    phoneNumber: '4950515253',
    email: 'benjamin@example.com',
    address: '303 Pine Pl, Eastside',
    contactPreference: 'whatsapp',
    createdAt: '2023-03-22T10:45:00.000Z',
    updatedAt: '2023-05-20T11:05:00.000Z',
    branchId: 'branch_main'
  }
];

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
    barcode: '123456789012',
    deviceLeft: true,
    sentToCentralService: false
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
    barcode: '234567890123',
    deviceLeft: false,
    sentToCentralService: true
  }
];