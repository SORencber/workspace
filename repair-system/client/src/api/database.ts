import api from './api';

// Description: Get database schema information
// Endpoint: GET /api/database/schema
// Request: {}
// Response: { schema: DatabaseSchema }
export const getDatabaseSchema = () => {
  // Mocking the response
  return new Promise<{ schema: DatabaseSchema }>((resolve) => {
    setTimeout(() => {
      resolve({ schema: mockDatabaseSchema });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/database/schema');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get database statistics
// Endpoint: GET /api/database/stats
// Request: {}
// Response: { stats: DatabaseStats }
export const getDatabaseStats = () => {
  // Mocking the response
  return new Promise<{ stats: DatabaseStats }>((resolve) => {
    setTimeout(() => {
      resolve({ stats: mockDatabaseStats });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/database/stats');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type FieldType = {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  reference?: string;
  description?: string;
  enum?: string[];
  default?: any;
};

export type ModelType = {
  name: string;
  collection: string;
  description: string;
  fields: FieldType[];
  relationships: RelationshipType[];
  indexes: IndexType[];
};

export type RelationshipType = {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  field: string;
  description: string;
};

export type IndexType = {
  fields: string[];
  type: string;
  unique?: boolean;
};

export type DatabaseSchema = {
  models: ModelType[];
  totalCollections: number;
  totalDocuments: number;
  databaseSize: string;
  lastUpdated: string;
};

export type DatabaseStats = {
  collections: CollectionStats[];
  totalSize: string;
  totalDocuments: number;
  avgDocumentSize: string;
  indexes: number;
};

export type CollectionStats = {
  name: string;
  count: number;
  size: string;
  avgDocumentSize: string;
  indexes: number;
};

// Mock data
const mockDatabaseSchema: DatabaseSchema = {
  models: [
    {
      name: 'User',
      collection: 'users',
      description: 'System users with different roles and permissions',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'name', type: 'String', required: true, description: 'Full name of the user' },
        { name: 'email', type: 'String', required: true, unique: true, description: 'Email address (unique)' },
        { name: 'password', type: 'String', required: true, description: 'Hashed password' },
        { name: 'role', type: 'String', required: true, enum: ['admin', 'branch_staff', 'technician'], default: 'branch_staff', description: 'User role in the system' },
        { name: 'branchId', type: 'ObjectId', required: false, reference: 'Branch', description: 'Reference to user\'s branch' },
        { name: 'active', type: 'Boolean', required: false, default: true, description: 'Whether user account is active' },
        { name: 'createdAt', type: 'Date', required: false, default: 'Date.now', description: 'Account creation timestamp' }
      ],
      relationships: [
        { type: 'many-to-one', target: 'Branch', field: 'branchId', description: 'User belongs to a branch' },
        { type: 'one-to-many', target: 'Order', field: 'createdBy', description: 'User can create multiple orders' }
      ],
      indexes: [
        { fields: ['email'], type: 'unique', unique: true },
        { fields: ['role'], type: 'regular' },
        { fields: ['branchId'], type: 'regular' }
      ]
    },
    {
      name: 'Branch',
      collection: 'branches',
      description: 'Physical locations/branches of the repair business',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'name', type: 'String', required: true, description: 'Branch name' },
        { name: 'address', type: 'String', required: true, description: 'Physical address' },
        { name: 'phoneNumber', type: 'String', required: true, description: 'Contact phone number' },
        { name: 'email', type: 'String', required: true, description: 'Contact email address' },
        { name: 'manager', type: 'String', required: false, description: 'Branch manager name' },
        { name: 'active', type: 'Boolean', required: false, default: true, description: 'Whether branch is operational' },
        { name: 'createdAt', type: 'Date', required: false, default: 'Date.now', description: 'Branch creation timestamp' }
      ],
      relationships: [
        { type: 'one-to-many', target: 'User', field: 'branchId', description: 'Branch has multiple users' },
        { type: 'one-to-many', target: 'Customer', field: 'branchId', description: 'Branch serves multiple customers' },
        { type: 'one-to-many', target: 'Order', field: 'branchId', description: 'Branch processes multiple orders' }
      ],
      indexes: [
        { fields: ['name'], type: 'regular' },
        { fields: ['active'], type: 'regular' }
      ]
    },
    {
      name: 'Customer',
      collection: 'customers',
      description: 'Customers who bring devices for repair',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'name', type: 'String', required: false, description: 'Customer full name' },
        { name: 'phoneNumber', type: 'String', required: false, description: 'Primary contact number' },
        { name: 'email', type: 'String', required: false, description: 'Email address' },
        { name: 'address', type: 'String', required: false, description: 'Customer address' },
        { name: 'contactPreference', type: 'String', required: false, enum: ['sms', 'email', 'whatsapp'], default: 'sms', description: 'Preferred contact method' },
        { name: 'branchId', type: 'ObjectId', required: false, reference: 'Branch', description: 'Primary branch for customer' },
        { name: 'createdAt', type: 'Date', required: false, default: 'Date.now', description: 'Customer registration timestamp' },
        { name: 'updatedAt', type: 'Date', required: false, default: 'Date.now', description: 'Last update timestamp' }
      ],
      relationships: [
        { type: 'many-to-one', target: 'Branch', field: 'branchId', description: 'Customer belongs to a branch' },
        { type: 'one-to-many', target: 'Order', field: 'customerId', description: 'Customer can have multiple orders' }
      ],
      indexes: [
        { fields: ['phoneNumber'], type: 'regular' },
        { fields: ['email'], type: 'regular' },
        { fields: ['branchId'], type: 'regular' }
      ]
    },
    {
      name: 'Order',
      collection: 'orders',
      description: 'Repair orders with items, status tracking, and customer information',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'orderNumber', type: 'String', required: true, unique: true, description: 'Human-readable order number' },
        { name: 'customerId', type: 'ObjectId', required: true, reference: 'Customer', description: 'Reference to customer' },
        { name: 'items', type: 'Array[OrderItem]', required: true, description: 'Array of order items with parts' },
        { name: 'status', type: 'String', required: true, enum: ['pending', 'in_process', 'shipped', 'completed', 'closed'], default: 'pending', description: 'Current order status' },
        { name: 'totalAmount', type: 'Number', required: true, description: 'Total order amount in currency' },
        { name: 'branchId', type: 'ObjectId', required: true, reference: 'Branch', description: 'Branch processing the order' },
        { name: 'createdBy', type: 'ObjectId', required: false, reference: 'User', description: 'User who created the order' },
        { name: 'notes', type: 'String', required: false, description: 'Additional notes or instructions' },
        { name: 'barcode', type: 'String', required: false, description: 'Generated barcode for tracking' },
        { name: 'deviceLeft', type: 'Boolean', required: false, default: false, description: 'Whether device was left at branch' },
        { name: 'sentToCentralService', type: 'Boolean', required: false, default: false, description: 'Whether sent to central repair service' },
        { name: 'createdAt', type: 'Date', required: false, default: 'Date.now', description: 'Order creation timestamp' },
        { name: 'updatedAt', type: 'Date', required: false, default: 'Date.now', description: 'Last update timestamp' }
      ],
      relationships: [
        { type: 'many-to-one', target: 'Customer', field: 'customerId', description: 'Order belongs to a customer' },
        { type: 'many-to-one', target: 'Branch', field: 'branchId', description: 'Order processed by a branch' },
        { type: 'many-to-one', target: 'User', field: 'createdBy', description: 'Order created by a user' }
      ],
      indexes: [
        { fields: ['orderNumber'], type: 'unique', unique: true },
        { fields: ['customerId'], type: 'regular' },
        { fields: ['status'], type: 'regular' },
        { fields: ['branchId'], type: 'regular' },
        { fields: ['barcode'], type: 'regular' },
        { fields: ['createdAt'], type: 'regular' }
      ]
    },
    {
      name: 'OrderItem',
      collection: 'embedded',
      description: 'Embedded document within Order representing repair items',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier for the item' },
        { name: 'brand', type: 'String', required: true, description: 'Device brand (e.g., Apple, Samsung)' },
        { name: 'model', type: 'String', required: true, description: 'Device model (e.g., iPhone 12, Galaxy S21)' },
        { name: 'parts', type: 'Array[OrderPart]', required: true, description: 'Array of parts needed for repair' },
        { name: 'totalPrice', type: 'Number', required: true, description: 'Total price for this item including all parts' }
      ],
      relationships: [],
      indexes: []
    },
    {
      name: 'OrderPart',
      collection: 'embedded',
      description: 'Embedded document within OrderItem representing individual parts',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier for the part' },
        { name: 'name', type: 'String', required: true, description: 'Part name (e.g., Screen, Battery, Camera)' },
        { name: 'price', type: 'Number', required: true, description: 'Unit price of the part' },
        { name: 'quantity', type: 'Number', required: true, description: 'Quantity of parts needed' }
      ],
      relationships: [],
      indexes: []
    }
  ],
  totalCollections: 4,
  totalDocuments: 0,
  databaseSize: '12.5 MB',
  lastUpdated: new Date().toISOString()
};

const mockDatabaseStats: DatabaseStats = {
  collections: [
    { name: 'users', count: 12, size: '2.1 MB', avgDocumentSize: '180 KB', indexes: 4 },
    { name: 'branches', count: 3, size: '45 KB', avgDocumentSize: '15 KB', indexes: 2 },
    { name: 'customers', count: 156, size: '4.2 MB', avgDocumentSize: '27 KB', indexes: 3 },
    { name: 'orders', count: 89, size: '6.1 MB', avgDocumentSize: '69 KB', indexes: 6 }
  ],
  totalSize: '12.5 MB',
  totalDocuments: 260,
  avgDocumentSize: '48 KB',
  indexes: 15
};