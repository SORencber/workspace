import api from './api';

// Description: Get current user
// Endpoint: GET /api/users/me
// Request: {}
// Response: { user: UserType }
export const getCurrentUser = () => {
  // Mocking the response
  return new Promise<{ user: UserType }>((resolve) => {
    setTimeout(() => {
      resolve({ user: mockCurrentUser });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/users/me');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get all users (admin only)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: UserType[] }
export const getAllUsers = () => {
  // Mocking the response
  return new Promise<{ users: UserType[] }>((resolve) => {
    setTimeout(() => {
      resolve({ users: mockUsers });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/users');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Types
export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'branch_staff' | 'technician';
  branchId: string;
  active: boolean;
};

// Mock data
const mockCurrentUser: UserType = {
  _id: 'user_admin',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  branchId: 'branch_main',
  active: true
};

const mockUsers: UserType[] = [
  mockCurrentUser,
  {
    _id: 'user_staff1',
    name: 'Staff User 1',
    email: 'staff1@example.com',
    role: 'branch_staff',
    branchId: 'branch_main',
    active: true
  },
  {
    _id: 'user_staff2',
    name: 'Staff User 2',
    email: 'staff2@example.com',
    role: 'branch_staff',
    branchId: 'branch_north',
    active: true
  },
  {
    _id: 'user_tech1',
    name: 'Tech User 1',
    email: 'tech1@example.com',
    role: 'technician',
    branchId: 'branch_main',
    active: true
  }
];