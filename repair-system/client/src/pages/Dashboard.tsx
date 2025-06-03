import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Package,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { getBranchOrders } from "@/api/orders";
import { getBranchSummary } from "@/api/accounting";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { OrderType } from "@/api/customers";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [accountingSummary, setAccountingSummary] = useState<{
    income: number;
    expense: number;
    balance: number;
  }>({
    income: 0,
    expense: 0,
    balance: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { user } = await getCurrentUser();
        setUser(user);

        // Get orders for user's branch
        const { orders } = await getBranchOrders(user.branchId);
        setOrders(orders);

        // Get accounting summary for user's branch
        const { summary } = await getBranchSummary(user.branchId);
        setAccountingSummary({
          income: summary.income,
          expense: summary.expense,
          balance: summary.balance
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const inProcessOrders = orders.filter(o => o.status === 'in_process').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.length > 10 ? '+10% from last month' : 'Same as last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders > 5 ? 'Needs attention' : 'On track'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountingSummary.income.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountingSummary.income > 1000 ? '+15% from last month' : '+5% from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountingSummary.expense.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountingSummary.expense > 1000 ? '+10% from last month' : 'Same as last month'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders across all branches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading recent orders...</p>
              ) : orders.length === 0 ? (
                <p>No orders found</p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <Link to={`/orders/${order._id}`} className="font-medium hover:underline">
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'in_process' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="ml-2 font-medium">${order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/orders"
                className="text-sm text-primary hover:underline"
              >
                View all orders
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>
              Current month's financial summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-green-100 p-2">
                    <TrendingUp className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium">Total Income</p>
                    <p className="text-xs text-muted-foreground">Current Month</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">
                  ${accountingSummary.income.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-red-100 p-2">
                    <TrendingDown className="h-4 w-4 text-red-700" />
                  </div>
                  <div>
                    <p className="font-medium">Total Expenses</p>
                    <p className="text-xs text-muted-foreground">Current Month</p>
                  </div>
                </div>
                <span className="font-bold text-red-600">
                  ${accountingSummary.expense.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Net Balance</p>
                      <p className="text-xs text-muted-foreground">Current Month</p>
                    </div>
                  </div>
                  <span className={`font-bold ${accountingSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${accountingSummary.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/accounting"
                className="text-sm text-primary hover:underline"
              >
                View financial details
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}