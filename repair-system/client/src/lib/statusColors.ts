// Colors for order status
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
    case 'in_process':
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    case 'shipped':
      return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
    case 'completed':
      return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    case 'closed':
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800/30';
    default:
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800/30';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_process':
      return 'In Process';
    case 'shipped':
      return 'Shipped';
    case 'completed':
      return 'Completed';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};