import api from './api';

// Description: Update user profile
// Endpoint: PUT /api/users/profile
// Request: { name: string, email: string }
// Response: { user: UserType }
export const updateUserProfile = (data: { name: string; email: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          _id: 'user_admin',
          name: data.name,
          email: data.email,
          role: 'admin',
          branchId: 'branch_main',
          active: true
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/users/profile', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update notification settings
// Endpoint: PUT /api/users/notifications
// Request: { emailNotifications: boolean, smsNotifications: boolean, orderUpdates: boolean, marketingEmails: boolean }
// Response: { success: boolean }
export const updateNotificationSettings = (data: {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/users/notifications', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update appearance settings
// Endpoint: PUT /api/users/appearance
// Request: { theme: string, compactMode: boolean }
// Response: { success: boolean }
export const updateAppearanceSettings = (data: {
  theme: string;
  compactMode: boolean;
}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/users/appearance', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};