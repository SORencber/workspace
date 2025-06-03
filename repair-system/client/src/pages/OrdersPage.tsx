import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  Store,
  User,
  X,
  RefreshCw,
  Calendar,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { OrderType } from "@/api/customers";
import { getOrders, searchOrders } from "@/api/orders";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { getBranches } from "@/api/branches";
import { BranchType } from "@/api/branches";
import { getAllUsers } from "@/api/users";
import { getAllCustomers } from "@/api/customers";
import { CustomerType } from "@/api/customers";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/DataTable";

export function OrdersPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrderType | "";
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });
  const [dataFetched, setDataFetched] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dateFilter, setDateFilter] = useState<{from: Date | null, to: Date | null}>({from: null, to: null});
  const [amountFilter, setAmountFilter] = useState<{min: number | null, max: number | null}>({min: null, max: null});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    if (dataFetched) return;

    try {
      setIsLoading(true);

      // Get current user
      const { user } = await getCurrentUser();
      setUser(user);

      // Get all users for displaying who created the order
      const { users } = await getAllUsers();
      setUsers(users);

      // Get all branches for displaying branch information
      const { branches } = await getBranches();
      setBranches(branches);

      // Get customers for displaying customer information
      const { customers } = await getAllCustomers();
      setCustomers(customers);

      // Get orders based on user role
      // If admin, get all orders, otherwise get orders for user's branch
      let fetchedOrders;
      if (user.role === 'admin') {
        const { orders } = await getOrders();
        fetchedOrders = orders;
      } else {
        const { orders } = await getOrders({ branchId: user.branchId });
        fetchedOrders = orders;
      }

      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);

      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, dataFetched]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle real-time filtering
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters();
  };

  const applyFilters = useCallback(() => {
    if (!orders.length) return;
    
    let result = [...orders];
    const activeFiltersList = [];

    // Search term filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(query) || 
        (order.barcode && order.barcode.toLowerCase().includes(query)) ||
        (order.notes && order.notes.toLowerCase().includes(query))
      );
      activeFiltersList.push('search');
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
      activeFiltersList.push('status');
    }

    // Branch filter
    if (user?.role === 'admin' && branchFilter !== "all") {
      result = result.filter(order => order.branchId === branchFilter);
      activeFiltersList.push('branch');
    }

    // User filter
    if (userFilter !== "all") {
      result = result.filter(order => order.createdBy === userFilter);
      activeFiltersList.push('user');
    }

    // Date range filter
    if (dateFilter.from || dateFilter.to) {
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (dateFilter.from && dateFilter.to) {
          return orderDate >= dateFilter.from && orderDate <= dateFilter.to;
        } else if (dateFilter.from) {
          return orderDate >= dateFilter.from;
        } else if (dateFilter.to) {
          return orderDate <= dateFilter.to;
        }
        return true;
      });
      activeFiltersList.push('date');
    }

    // Amount range filter
    if (amountFilter.min || amountFilter.max) {
      result = result.filter(order => {
        if (amountFilter.min && amountFilter.max) {
          return order.totalAmount >= amountFilter.min && order.totalAmount <= amountFilter.max;
        } else if (amountFilter.min) {
          return order.totalAmount >= amountFilter.min;
        } else if (amountFilter.max) {
          return order.totalAmount <= amountFilter.max;
        }
        return true;
      });
      activeFiltersList.push('amount');
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key as keyof OrderType] < b[sortConfig.key as keyof OrderType]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key as keyof OrderType] > b[sortConfig.key as keyof OrderType]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(result);
    setActiveFilters(activeFiltersList);
  }, [orders, searchTerm, statusFilter, branchFilter, userFilter, dateFilter, amountFilter, sortConfig, user]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (orders.length) {
      applyFilters();
    }
  }, [orders, statusFilter, branchFilter, userFilter, sortConfig, dateFilter, amountFilter, applyFilters]);

  // Apply search debouncing
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);

    setDebounceTimeout(timeout);
    
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [searchTerm, applyFilters]);

  const handleSort = (key: keyof OrderType) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBranchFilter("all");
    setUserFilter("all");
    setDateFilter({from: null, to: null});
    setAmountFilter({min: null, max: null});
  };

  const resetData = () => {
    setDataFetched(false);
    fetchData();
    clearFilters();
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : userId;
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.name : branchId;
  };

  // Column definitions for the data table
  const columns = [
    {
      key: "orderNumber" as keyof OrderType,
      title: t("orders.orderNumber"),
      sortable: true
    },
    {
      key: "createdAt" as keyof OrderType,
      title: t("common.date"),
      sortable: true,
      render: (order: OrderType) => format(new Date(order.createdAt), 'dd/MM/yyyy')
    },
    {
      key: "customerId" as keyof OrderType,
      title: t("customers.customerInfo"),
      render: (order: OrderType) => (
        <div className="flex flex-col">
          <span className="font-medium">{getCustomerName(order.customerId)}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
            {customers.find(c => c._id === order.customerId)?.phoneNumber || ''}
          </span>
        </div>
      )
    },
    {
      key: "status" as keyof OrderType,
      title: t("common.status"),
      sortable: true,
      render: (order: OrderType) => <StatusBadge status={order.status} />
    },
    {
      key: "createdBy" as keyof OrderType,
      title: t("users.title"),
      render: (order: OrderType) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{getUserName(order.createdBy)}</span>
        </div>
      )
    },
    {
      key: "branchId" as keyof OrderType,
      title: t("branches.title"),
      render: (order: OrderType) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span>{getBranchName(order.branchId)}</span>
        </div>
      )
    },
    {
      key: "totalAmount" as keyof OrderType,
      title: t("common.amount"),
      sortable: true,
      render: (order: OrderType) => (
        <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
      )
    },
  ];

  // Calculate paginated orders
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const renderFilterBadges = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {activeFilters.includes('search') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("common.search")}: {searchTerm}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setSearchTerm("")} 
            />
          </Badge>
        )}
        {activeFilters.includes('status') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("common.status")}: {t(`orders.status.${statusFilter.replace("_", "")}`)}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setStatusFilter("all")} 
            />
          </Badge>
        )}
        {activeFilters.includes('branch') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("branches.title")}: {getBranchName(branchFilter)}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setBranchFilter("all")} 
            />
          </Badge>
        )}
        {activeFilters.includes('user') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("users.title")}: {getUserName(userFilter)}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setUserFilter("all")} 
            />
          </Badge>
        )}
        {activeFilters.includes('date') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("common.date")}: 
            {dateFilter.from && format(dateFilter.from, 'dd/MM/yyyy')}
            {dateFilter.from && dateFilter.to && " - "}
            {dateFilter.to && format(dateFilter.to, 'dd/MM/yyyy')}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setDateFilter({from: null, to: null})} 
            />
          </Badge>
        )}
        {activeFilters.includes('amount') && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t("common.amount")}: 
            {amountFilter.min && `$${amountFilter.min}`}
            {amountFilter.min && amountFilter.max && " - "}
            {amountFilter.max && `$${amountFilter.max}`}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => setAmountFilter({min: null, max: null})} 
            />
          </Badge>
        )}
        {activeFilters.length > 0 && (
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-secondary" 
            onClick={clearFilters}
          >
            {t("common.reset")} {t("common.filters")}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("orders.title")}</h1>
        <Button asChild>
          <Link to="/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("orders.newOrder")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orders.orderManagement")}</CardTitle>
          <CardDescription>
            {t("orders.title")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search input */}
              <div className="flex w-full sm:w-1/3 items-center space-x-2 relative">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("orders.searchByNumber")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-8"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isSearching && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Status filter */}
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t("orders.filterByStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
                    <SelectItem value="pending">{t("orders.status.pending")}</SelectItem>
                    <SelectItem value="in_process">{t("orders.status.in_process")}</SelectItem>
                    <SelectItem value="shipped">{t("orders.status.shipped")}</SelectItem>
                    <SelectItem value="completed">{t("orders.status.completed")}</SelectItem>
                    <SelectItem value="closed">{t("orders.status.closed")}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Branch filter for admin users */}
                {user?.role === 'admin' && (
                  <Select
                    value={branchFilter}
                    onValueChange={setBranchFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("branches.title")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map(branch => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* User filter */}
                <Select
                  value={userFilter}
                  onValueChange={setUserFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("users.title")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Advanced filter dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("common.filters")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4">
                    <h3 className="font-medium mb-2">{t("common.date")} {t("common.range")}</h3>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="dateFrom">From</Label>
                          <Input 
                            id="dateFrom"
                            type="date"
                            value={dateFilter.from ? format(dateFilter.from, 'yyyy-MM-dd') : ''}
                            onChange={e => setDateFilter(prev => ({
                              ...prev, 
                              from: e.target.value ? new Date(e.target.value) : null
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateTo">To</Label>
                          <Input 
                            id="dateTo"
                            type="date"
                            value={dateFilter.to ? format(dateFilter.to, 'yyyy-MM-dd') : ''}
                            onChange={e => setDateFilter(prev => ({
                              ...prev, 
                              to: e.target.value ? new Date(e.target.value) : null
                            }))}
                          />
                        </div>
                      </div>

                      <h3 className="font-medium mb-2 mt-2">{t("common.amount")} {t("common.range")}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="amountMin">Min ($)</Label>
                          <Input 
                            id="amountMin"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amountFilter.min === null ? '' : amountFilter.min}
                            onChange={e => setAmountFilter(prev => ({
                              ...prev, 
                              min: e.target.value ? parseFloat(e.target.value) : null
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="amountMax">Max ($)</Label>
                          <Input 
                            id="amountMax"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="1000.00"
                            value={amountFilter.max === null ? '' : amountFilter.max}
                            onChange={e => setAmountFilter(prev => ({
                              ...prev, 
                              max: e.target.value ? parseFloat(e.target.value) : null
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        {t("common.reset")}
                      </Button>
                      <Button size="sm" onClick={() => applyFilters()}>
                        {t("common.apply")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetData}
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Active filter badges */}
            {renderFilterBadges()}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t("orders.noOrders")}</p>
            </div>
          ) : (
            <div>
              <DataTable
                data={displayedOrders}
                columns={columns}
                searchPlaceholder={t("orders.searchByNumber")}
                actionColumn={(order) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link to={`/orders/${order._id}`}>
                      {t("common.viewDetails")}
                    </Link>
                  </Button>
                )}
                pagination={{
                  pageSize,
                  totalItems: filteredOrders.length,
                  currentPage: page,
                  onPageChange: handlePageChange,
                  onPageSizeChange: handlePageSizeChange
                }}
                sorting={{
                  sortKey: sortConfig.key as keyof OrderType,
                  sortDirection: sortConfig.direction,
                  onSortChange: handleSort
                }}
                filtering={{
                  searchTerm,
                  onSearchChange: handleSearchChange
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}