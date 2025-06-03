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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Search,
  Phone,
  Mail,
  MessageSquare,
  User,
  Package,
  Loader2,
  Users as UsersIcon,
  RefreshCw,
  X,
  Undo
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/useToast";
import { CustomerType, OrderType, searchCustomerByPhone, createOrUpdateCustomer, getCustomerOrders, getAllCustomers, searchCustomers } from "@/api/customers";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { useTranslation } from "react-i18next";

// Form schema for customer - all fields optional now
const customerFormSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  address: z.string().optional(),
  contactPreference: z.enum(["sms", "email", "whatsapp"], {
    required_error: "Please select a preferred contact method.",
  }).default("sms")
});

export function CustomersPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerListLoading, setCustomerListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  // Setup form
  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      contactPreference: "sms"
    }
  });

  // Fetch user only once when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getCurrentUser();
        setCurrentUser(user);
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user information",
          variant: "destructive"
        });
      }
    };

    fetchUser();
  }, [toast]);

  // Fetch customers once when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Check for state passed from NewOrderPage or other components
  useEffect(() => {
    const refreshOrdersIfNeeded = async () => {
      if (location.state?.refreshOrders && currentCustomer?._id) {
        refreshCustomerOrders(currentCustomer._id);
      }
    };

    refreshOrdersIfNeeded();
  }, [location.state, currentCustomer]);

  const fetchCustomers = async () => {
    setCustomerListLoading(true);
    try {
      const { customers } = await getAllCustomers();
      setCustomers(customers);
      setFilteredCustomers(customers);
    } catch (error: any) {
      console.error("Failed to fetch customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setCustomerListLoading(false);
    }
  };

  // Fixed the dependency array to prevent continuous re-rendering
  const searchCustomersWithDebounce = useCallback((query: string) => {
    setIsSearching(true);

    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setFilteredCustomers(customers);
        setIsSearching(false);
        return;
      }

      try {
        const { customers: searchResults, totalCount, totalPages, currentPage } = await searchCustomers(query, 1, 20);
        setFilteredCustomers(searchResults);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
        setPage(currentPage);
      } catch (error: any) {
        console.error("Error searching customers:", error);
        toast({
          title: "Error",
          description: "Failed to search customers",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce time

    setDebounceTimeout(timeout);
  }, [customers, toast]);

  // When searchTerm changes, trigger the debounced search
  // Added proper dependency array to prevent infinite loop
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCustomers(customers);
      setIsSearching(false);
    } else {
      searchCustomersWithDebounce(searchTerm);
    }
    // searchTerm is the only dependency we need here
  }, [searchTerm]);

  const refreshCustomerOrders = async (customerId: string) => {
    setIsRefreshing(true);
    try {
      const { orders } = await getCustomerOrders(customerId);
      setCustomerOrders(orders);
      toast({
        title: "Success",
        description: "Order history refreshed"
      });
    } catch (error: any) {
      console.error("Error refreshing orders:", error);
      toast({
        title: "Error",
        description: "Failed to refresh order history",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset form with customer data
  useEffect(() => {
    if (currentCustomer) {
      form.reset({
        name: currentCustomer.name,
        phoneNumber: currentCustomer.phoneNumber,
        email: currentCustomer.email,
        address: currentCustomer.address || "",
        contactPreference: currentCustomer.contactPreference
      });
    } else {
      form.reset({
        name: "",
        phoneNumber: searchPhone,
        email: "",
        address: "",
        contactPreference: "sms"
      });
    }
  }, [currentCustomer, form, searchPhone]);

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number to search",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { customer } = await searchCustomerByPhone(searchPhone);
      setCurrentCustomer(customer);

      if (customer) {
        const { orders } = await getCustomerOrders(customer._id || "");
        setCustomerOrders(orders);
        toast({
          title: "Customer Found",
          description: `Found customer: ${customer.name}`
        });
      } else {
        setCustomerOrders([]);
        setIsDialogOpen(true);
        toast({
          title: "Customer Not Found",
          description: "No customer found with that phone number",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error searching for customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search for customer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof customerFormSchema>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const customerData: CustomerType = {
        ...data,
        branchId: currentUser.branchId,
        ...(currentCustomer?._id ? { _id: currentCustomer._id } : {})
      };

      const { customer, isNew } = await createOrUpdateCustomer(customerData);
      setCurrentCustomer(customer);
      setIsDialogOpen(false);

      // Refresh the customer list after adding/updating
      fetchCustomers();

      // Refresh customer orders
      if (customer._id) {
        const { orders } = await getCustomerOrders(customer._id);
        setCustomerOrders(orders);
      }

      if (isNew) {
        setCustomerOrders([]);
        toast({
          title: "Success",
          description: "Customer created successfully"
        });
      } else {
        toast({
          title: "Success",
          description: "Customer updated successfully"
        });
      }
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save customer information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectCustomer = async (customer: CustomerType) => {
    setCurrentCustomer(customer);
    setSearchPhone(customer.phoneNumber);

    try {
      const { orders } = await getCustomerOrders(customer._id || "");
      setCustomerOrders(orders);
    } catch (error: any) {
      console.error("Error fetching customer orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer orders",
        variant: "destructive"
      });
      setCustomerOrders([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCustomers(customers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("customers.title")}</h1>
        <Button onClick={() => {
          setCurrentCustomer(null);
          setCustomerOrders([]);
          setSearchPhone("");
          setIsDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("customers.newCustomer")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("customers.searchCustomer")}</CardTitle>
          <CardDescription>
            {t("newOrder.searchByPhone")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-md items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder={t("newOrder.searchByPhone")}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-2" />
              {t("newOrder.find")}
            </Button>
            {currentCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentCustomer(null);
                  setSearchPhone("");
                }}
              >
                <Undo className="h-4 w-4 mr-2" />
                {t("newOrder.changeCustomer")}
              </Button>
            )}
          </div>

          {currentCustomer && (
            <div className="p-4 border rounded-md bg-secondary/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">{t("customers.name")}:</span> {currentCustomer.name}</p>
                  <p><span className="font-medium">{t("customers.phone")}:</span> {currentCustomer.phoneNumber}</p>
                  <p><span className="font-medium">{t("customers.email")}:</span> {currentCustomer.email}</p>
                </div>
                <div>
                  {currentCustomer.address && (
                    <p><span className="font-medium">{t("customers.address")}:</span> {currentCustomer.address}</p>
                  )}
                  <p>
                    <span className="font-medium">{t("customers.contactPreference")}:</span>
                    <span className="capitalize ml-1">{currentCustomer.contactPreference}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!currentCustomer && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {t("newOrder.searchByPhone")} {t("common.or")}
                <Link to="/customers" className="text-primary ml-1 hover:underline">
                  {t("customers.createCustomer")}
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentCustomer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("customers.customerInfo")}</CardTitle>
              <CardDescription>
                {t("customers.contactInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t("customers.name")}:</span>
                    <span className="ml-2">{currentCustomer.name || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t("customers.phone")}:</span>
                    <span className="ml-2">{currentCustomer.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t("customers.email")}:</span>
                    <span className="ml-2">{currentCustomer.email || "Not provided"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {currentCustomer.address && (
                    <div>
                      <span className="font-medium">{t("customers.address")}:</span>
                      <p className="text-sm text-muted-foreground">
                        {currentCustomer.address}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t("customers.contactPreference")}:</span>
                    <span className="ml-2 capitalize">
                      {currentCustomer.contactPreference}
                    </span>
                  </div>
                  <div className="flex items-center pt-2">
                    <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
                      {t("common.edit")} {t("customers.customerInfo")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      asChild
                    >
                      <Link to={`/orders/new?customerId=${currentCustomer._id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        {t("orders.newOrder")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("customers.orderHistory")}</CardTitle>
                <CardDescription>
                  {t("orders.title")} {t("common.for")} {t("customers.customerInfo")}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => currentCustomer._id && refreshCustomerOrders(currentCustomer._id)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t("common.refresh")}
              </Button>
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="text-muted-foreground">{t("orders.noOrders")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("orders.orderNumber")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.amount")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full
                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'in_process' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'}`}>
                            {t(`orders.status.${order.status.replace('_', '')}`)}
                          </span>
                        </TableCell>
                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <Link to={`/orders/${order._id}`}>
                              {t("common.viewDetails")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!currentCustomer && !customerListLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{t("customers.customerList")}</CardTitle>
            <CardDescription>
              {t("customers.allCustomers")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("common.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-10 max-w-md"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isSearching && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Searching...
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("customers.name")}</TableHead>
                    <TableHead>{t("customers.phone")}</TableHead>
                    <TableHead>{t("customers.email")}</TableHead>
                    <TableHead>{t("customers.contactPreference")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm ? t("common.noResults") : t("customers.noCustomers")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell>{customer.name || "Not provided"}</TableCell>
                        <TableCell>{customer.phoneNumber || "Not provided"}</TableCell>
                        <TableCell>{customer.email || "Not provided"}</TableCell>
                        <TableCell className="capitalize">{customer.contactPreference}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectCustomer(customer)}
                          >
                            {t("common.viewDetails")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentCustomer && customerListLoading && (
        <Card>
          <CardContent className="flex justify-center py-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p>{t("common.loading")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentCustomer && !customerListLoading && filteredCustomers.length === 0 && !searchTerm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">{t("customers.noCustomers")}</p>
            <p className="text-sm text-muted-foreground mb-6">{t("customers.createFirstCustomer")}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("customers.createCustomer")}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentCustomer ? t("customers.updateCustomer") : t("customers.createCustomer")}
            </DialogTitle>
            <DialogDescription>
              {currentCustomer
                ? t("customers.updateCustomer")
                : t("customers.createCustomer")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("customers.name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.phone")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("customers.phone")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.email")} ({t("common.optional")})</FormLabel>
                    <FormControl>
                      <Input placeholder={t("customers.email")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.address")} ({t("common.optional")})</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("customers.address")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.contactPreference")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sms" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            SMS
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="email" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Email
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="whatsapp" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            WhatsApp
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : currentCustomer ? (
                    t("customers.updateCustomer")
                  ) : (
                    t("customers.createCustomer")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}