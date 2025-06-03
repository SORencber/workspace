import api from './api';

// Description: Get branch accounting entries
// Endpoint: GET /api/accounting?branchId={branchId}
// Request: { branchId: string }
// Response: { entries: AccountingEntryType[] }
export const getBranchAccountingEntries = (branchId: string) => {
  // Mocking the response
  return new Promise<{ entries: AccountingEntryType[] }>((resolve) => {
    setTimeout(() => {
      const entries = mockAccountingEntries.filter(entry => entry.branchId === branchId);
      resolve({ entries });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/accounting?branchId=${branchId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Create accounting entry
// Endpoint: POST /api/accounting
// Request: { entry: Partial<AccountingEntryType> }
// Response: { entry: AccountingEntryType }
export const createAccountingEntry = (entry: Partial<AccountingEntryType>) => {
  // Mocking the response
  return new Promise<{ entry: AccountingEntryType }>((resolve) => {
    setTimeout(() => {
      const newEntry: AccountingEntryType = {
        _id: `entry_${Math.random().toString(36).substring(2, 9)}`,
        amount: entry.amount || 0,
        description: entry.description || '',
        type: entry.type || 'income',
        category: entry.category || 'other',
        branchId: entry.branchId || 'branch_main',
        createdAt: new Date().toISOString(),
        createdBy: entry.createdBy || 'user_admin'
      };
      mockAccountingEntries.push(newEntry);
      resolve({ entry: newEntry });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/accounting', { entry });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get branch summary
// Endpoint: GET /api/accounting/summary?branchId={branchId}
// Request: { branchId: string }
// Response: { summary: AccountingSummaryType }
export const getBranchSummary = (branchId: string) => {
  // Mocking the response
  return new Promise<{ summary: AccountingSummaryType }>((resolve) => {
    setTimeout(() => {
      const entries = mockAccountingEntries.filter(entry => entry.branchId === branchId);
      const income = entries.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
      const expense = entries.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
      
      resolve({
        summary: {
          income,
          expense,
          balance: income - expense,
          entryCount: entries.length,
          lastUpdated: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/accounting/summary?branchId=${branchId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type AccountingEntryType = {
  _id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: 'repair' | 'parts' | 'salary' | 'rent' | 'utilities' | 'other';
  branchId: string;
  createdAt: string;
  createdBy: string;
};

export type AccountingSummaryType = {
  income: number;
  expense: number;
  balance: number;
  entryCount: number;
  lastUpdated: string;
};

// Mock data
const mockAccountingEntries: AccountingEntryType[] = [
  {
    _id: 'entry_1',
    amount: 230,
    description: 'Payment for order ORD-001',
    type: 'income',
    category: 'repair',
    branchId: 'branch_main',
    createdAt: '2023-04-18T14:45:00.000Z',
    createdBy: 'user_staff1'
  },
  {
    _id: 'entry_2',
    amount: 120,
    description: 'Payment for order ORD-002',
    type: 'income',
    category: 'repair',
    branchId: 'branch_main',
    createdAt: '2023-05-10T09:15:00.000Z',
    createdBy: 'user_staff1'
  },
  {
    _id: 'entry_3',
    amount: 500,
    description: 'Parts inventory purchase',
    type: 'expense',
    category: 'parts',
    branchId: 'branch_main',
    createdAt: '2023-05-05T10:30:00.000Z',
    createdBy: 'user_admin'
  },
  {
    _id: 'entry_4',
    amount: 1000,
    description: 'Monthly rent',
    type: 'expense',
    category: 'rent',
    branchId: 'branch_main',
    createdAt: '2023-05-01T09:00:00.000Z',
    createdBy: 'user_admin'
  },
  {
    _id: 'entry_5',
    amount: 240,
    description: 'Payment for order ORD-003',
    type: 'income',
    category: 'repair',
    branchId: 'branch_main',
    createdAt: '2023-05-16T09:20:00.000Z',
    createdBy: 'user_staff2'
  }
];