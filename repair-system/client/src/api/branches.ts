import api from './api';

// Description: Get all branches
// Endpoint: GET /api/branches
// Request: {}
// Response: { branches: BranchType[] }
export const getBranches = () => {
  // Mocking the response
  return new Promise<{ branches: BranchType[] }>((resolve) => {
    setTimeout(() => {
      resolve({ branches: mockBranches });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/branches');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get branch details
// Endpoint: GET /api/branches/{branchId}
// Request: { branchId: string }
// Response: { branch: BranchType }
export const getBranchDetails = (branchId: string) => {
  // Mocking the response
  return new Promise<{ branch: BranchType }>((resolve, reject) => {
    setTimeout(() => {
      const branch = mockBranches.find(b => b._id === branchId);
      if (!branch) {
        reject(new Error('Branch not found'));
        return;
      }
      resolve({ branch });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/branches/${branchId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Create a new branch
// Endpoint: POST /api/branches
// Request: { branch: Partial<BranchType> }
// Response: { branch: BranchType }
export const createBranch = (branch: Partial<BranchType>) => {
  // Mocking the response
  return new Promise<{ branch: BranchType }>((resolve) => {
    setTimeout(() => {
      const newBranch: BranchType = {
        _id: `branch_${Math.random().toString(36).substring(2, 9)}`,
        name: branch.name || 'New Branch',
        address: branch.address || '',
        phoneNumber: branch.phoneNumber || '',
        email: branch.email || '',
        manager: branch.manager || '',
        active: branch.active !== undefined ? branch.active : true
      };
      mockBranches.push(newBranch);
      resolve({ branch: newBranch });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/branches', { branch });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update a branch
// Endpoint: PUT /api/branches/{branchId}
// Request: { branch: Partial<BranchType> }
// Response: { branch: BranchType }
export const updateBranch = (branchId: string, branch: Partial<BranchType>) => {
  // Mocking the response
  return new Promise<{ branch: BranchType }>((resolve, reject) => {
    setTimeout(() => {
      const index = mockBranches.findIndex(b => b._id === branchId);
      if (index === -1) {
        reject(new Error('Branch not found'));
        return;
      }
      
      const updatedBranch = {
        ...mockBranches[index],
        ...branch
      };
      
      mockBranches[index] = updatedBranch;
      resolve({ branch: updatedBranch });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/branches/${branchId}`, { branch });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type BranchType = {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  manager: string;
  active: boolean;
};

// Mock data
const mockBranches: BranchType[] = [
  {
    _id: 'branch_main',
    name: 'Main Branch',
    address: '123 Main St, City',
    phoneNumber: '123-456-7890',
    email: 'main@example.com',
    manager: 'John Doe',
    active: true
  },
  {
    _id: 'branch_north',
    name: 'North Branch',
    address: '456 North Ave, City',
    phoneNumber: '123-456-7891',
    email: 'north@example.com',
    manager: 'Jane Smith',
    active: true
  },
  {
    _id: 'branch_south',
    name: 'South Branch',
    address: '789 South Blvd, City',
    phoneNumber: '123-456-7892',
    email: 'south@example.com',
    manager: 'Robert Johnson',
    active: true
  }
];