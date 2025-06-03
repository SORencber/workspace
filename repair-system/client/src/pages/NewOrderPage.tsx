import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { CustomerType } from "@/api/customers";
import { searchCustomerByPhone, getCustomerOrders, getAllCustomers } from "@/api/customers";
import { getBrands, getModelsByBrand, getPartsByModel } from "@/api/catalog";
import { BrandType, ModelType, PartType } from "@/api/catalog";
import { createOrder } from "@/api/orders";
import { OrderType, OrderItemType, OrderPartType } from "@/api/customers";
import { PlusCircle, Trash2, Undo, Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Form schema for new order
const orderFormSchema = z.object({
  customerId: z.string({
    required_error: "Customer is required",
  }),
  notes: z.string().optional(),
});

interface CartItem {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  parts: {
    partId: string;
    partName: string;
    price: number;
    quantity: number;
  }[];
}

export function NewOrderPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [models, setModels] = useState<ModelType[]>([]);
  const [parts, setParts] = useState<PartType[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedParts, setSelectedParts] = useState<Map<string, number>>(new Map());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [newOrder, setNewOrder] = useState<OrderType | null>(null);
  const [allCustomers, setAllCustomers] = useState<CustomerType[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Setup form
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: customerId || "",
      notes: "",
    },
  });

  // Memoize total amount calculation to prevent unnecessary recalculations
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => {
      const itemTotal = item.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
      return total + itemTotal;
    }, 0);
  }, [cart]);

  // Fetch initial data only once
  useEffect(() => {
    if (initialDataLoaded) return;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { user } = await getCurrentUser();
        setCurrentUser(user);

        // Get all brands
        const { brands } = await getBrands();
        setBrands(brands);

        // Get all customers to find by ID
        const { customers } = await getAllCustomers();
        setAllCustomers(customers);

        // If customerId is provided in URL, find customer
        if (customerId) {
          const foundCustomer = customers.find(c => c._id === customerId);

          if (foundCustomer) {
            setCustomer(foundCustomer);
            setPhoneNumber(foundCustomer.phoneNumber);
            form.setValue("customerId", foundCustomer._id || "");
          } else {
            toast({
              title: "Customer Not Found",
              description: "The specified customer could not be found",
              variant: "destructive"
            });
          }
        }

        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [customerId, toast, form, initialDataLoaded]);

  // Memoized function to handle customer search
  const handleSearchCustomer = useCallback(async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { customer } = await searchCustomerByPhone(phoneNumber);
      setCustomer(customer);

      if (customer) {
        form.setValue("customerId", customer._id || "");
        toast({
          title: "Customer Found",
          description: `Found customer: ${customer.name}`,
        });
      } else {
        toast({
          title: "Customer Not Found",
          description: "No customer found with that phone number. Please create a customer first.",
          variant: "destructive",
        });
        form.setValue("customerId", "");
      }
    } catch (error) {
      console.error("Error searching for customer:", error);
      toast({
        title: "Error",
        description: "Failed to search for customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, toast, form]);

  // Memoized function to handle brand change
  const handleBrandChange = useCallback(async (brandId: string) => {
    if (!brandId) return;

    setSelectedBrandId(brandId);
    setSelectedModelId("");
    setParts([]);
    setSelectedParts(new Map());

    setIsLoading(true);
    try {
      const { models } = await getModelsByBrand(brandId);
      setModels(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description: "Failed to fetch models for the selected brand",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Memoized function to handle model change
  const handleModelChange = useCallback(async (modelId: string) => {
    if (!modelId) return;

    setSelectedModelId(modelId);
    setSelectedParts(new Map());

    setIsLoading(true);
    try {
      const { parts } = await getPartsByModel(modelId);
      setParts(parts);
    } catch (error) {
      console.error("Error fetching parts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch parts for the selected model",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Memoized function to handle part quantity change
  const handlePartQuantityChange = useCallback((partId: string, quantity: number) => {
    if (quantity < 0) return;

    setSelectedParts(prevParts => {
      const newPartsMap = new Map(prevParts);
      if (quantity === 0) {
        newPartsMap.delete(partId);
      } else {
        newPartsMap.set(partId, quantity);
      }
      return newPartsMap;
    });
  }, []);

  // Memoized function to add items to cart
  const addToCart = useCallback(() => {
    if (!selectedBrandId || !selectedModelId || selectedParts.size === 0) {
      toast({
        title: "Error",
        description: "Please select brand, model, and at least one part",
        variant: "destructive",
      });
      return;
    }

    const selectedBrand = brands.find(b => b._id === selectedBrandId);
    const selectedModel = models.find(m => m._id === selectedModelId);

    if (!selectedBrand || !selectedModel) {
      toast({
        title: "Error",
        description: "Invalid selection",
        variant: "destructive",
      });
      return;
    }

    const cartParts = Array.from(selectedParts.entries()).map(([partId, quantity]) => {
      const part = parts.find(p => p._id === partId);
      if (!part) throw new Error("Part not found");

      return {
        partId,
        partName: part.name,
        price: part.price,
        quantity,
      };
    });

    const newItem: CartItem = {
      brandId: selectedBrandId,
      brandName: selectedBrand.name,
      modelId: selectedModelId,
      modelName: selectedModel.name,
      parts: cartParts,
    };

    setCart(prevCart => [...prevCart, newItem]);

    // Reset selections for next item
    setSelectedModelId("");
    setModels([]);
    setParts([]);
    setSelectedParts(new Map());

    toast({
      title: "Added to Order",
      description: `${selectedModel.name} parts added to order`,
    });
  }, [selectedBrandId, selectedModelId, selectedParts, brands, models, parts, toast]);

  // Memoized function to remove items from cart
  const removeFromCart = useCallback((index: number) => {
    setCart(prevCart => {
      const itemToRemove = prevCart[index];
      const newCart = [...prevCart];
      newCart.splice(index, 1);

      toast({
        title: "Removed from Order",
        description: `${itemToRemove.modelName} removed from order`,
      });

      return newCart;
    });
  }, [toast]);

  // Memoized function to reset form
  const resetForm = useCallback(() => {
    setCart([]);
    setSelectedBrandId("");
    setSelectedModelId("");
    setModels([]);
    setParts([]);
    setSelectedParts(new Map());
    form.setValue("notes", "");
    setNewOrder(null);
  }, [form]);

  // Memoized function to handle form submission
  const onSubmit = useCallback(async (data: z.infer<typeof orderFormSchema>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      });
      return;
    }

    if (!customer) {
      toast({
        title: "Error",
        description: "Please select a customer for this order",
        variant: "destructive",
      });
      return;
    }

    // Check if there are items in the cart or if there are selected parts to add
    const hasItemsToAdd = selectedBrandId && selectedModelId && selectedParts.size > 0;
    const currentCart = [...cart];

    if (currentCart.length === 0 && !hasItemsToAdd) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    // If there are selected parts, add them to cart first
    if (hasItemsToAdd) {
      addToCart();
      return; // Let the cart update and user can submit again
    }

    setIsLoading(true);
    try {
      const orderItems: OrderItemType[] = currentCart.map(item => {
        const orderParts: OrderPartType[] = item.parts.map(part => ({
          _id: part.partId,
          name: part.partName,
          price: part.price,
          quantity: part.quantity
        }));

        return {
          _id: `item_${Math.random().toString(36).substring(2, 9)}`,
          brand: item.brandName,
          model: item.modelName,
          parts: orderParts,
          totalPrice: orderParts.reduce((sum, part) => sum + (part.price * part.quantity), 0)
        };
      });

      const orderData: Partial<OrderType> = {
        customerId: customer._id || "",
        items: orderItems,
        status: 'pending',
        totalAmount: totalAmount,
        notes: data.notes,
        branchId: currentUser.branchId
      };

      const { order } = await createOrder(orderData);
      setNewOrder(order);

      toast({
        title: "Success",
        description: `Order ${order.orderNumber} created successfully`,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, customer, cart, selectedBrandId, selectedModelId, selectedParts, totalAmount, addToCart, toast]);

  return (
    <div className="space-y-6 mb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("newOrder.title")}</h1>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          {t("common.back")}
        </Button>
      </div>

      {newOrder ? (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/50">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">{t("newOrder.orderCreatedSuccess")}</CardTitle>
            <CardDescription>
              {t("newOrder.orderCreatedDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">{t("orders.orderInfo")}</h3>
                <p><span className="font-medium">{t("orders.orderNumber")}:</span> {newOrder.orderNumber}</p>
                <p><span className="font-medium">{t("common.status")}:</span> {t("orders.status.pending")}</p>
                <p><span className="font-medium">{t("orders.totalAmount")}:</span> ${newOrder.totalAmount.toFixed(2)}</p>
                <p><span className="font-medium">{t("orders.createDate")}:</span> {new Date(newOrder.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("customers.customerInfo")}</h3>
                <p><span className="font-medium">{t("customers.name")}:</span> {customer?.name}</p>
                <p><span className="font-medium">{t("customers.phone")}:</span> {customer?.phoneNumber}</p>
                <p><span className="font-medium">{t("customers.email")}:</span> {customer?.email}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("orders.barcode")}</h3>
              <BarcodeDisplay value={newOrder.barcode || newOrder.orderNumber} printable={true} />
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("newOrder.createAnotherOrder")}
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/orders/${newOrder._id}`}>
                  {t("newOrder.viewOrderDetails")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("customers.customerInfo")}</CardTitle>
              <CardDescription>
                {t("newOrder.selectCustomer")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder={t("newOrder.searchByPhone")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!!customer || isLoading}
                />
                <Button
                  variant="outline"
                  onClick={handleSearchCustomer}
                  disabled={!!customer || isLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t("newOrder.find")}
                </Button>
                {customer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomer(null);
                      setPhoneNumber("");
                      form.setValue("customerId", "");
                    }}
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    {t("newOrder.changeCustomer")}
                  </Button>
                )}
              </div>

              {customer && (
                <div className="p-4 border rounded-md bg-secondary/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">{t("customers.name")}:</span> {customer.name}</p>
                      <p><span className="font-medium">{t("customers.phone")}:</span> {customer.phoneNumber}</p>
                      <p><span className="font-medium">{t("customers.email")}:</span> {customer.email}</p>
                    </div>
                    <div>
                      {customer.address && (
                        <p><span className="font-medium">{t("customers.address")}:</span> {customer.address}</p>
                      )}
                      <p>
                        <span className="font-medium">{t("customers.contactPreference")}:</span>
                        <span className="capitalize ml-1">{customer.contactPreference}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!customer && (
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

          <Card>
            <CardHeader>
              <CardTitle>{t("newOrder.orderItems")}</CardTitle>
              <CardDescription>
                {t("newOrder.brandModelParts")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t("catalog.brands")}</label>
                    <Select
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("newOrder.selectBrand")} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("catalog.models")}</label>
                    <Select
                      value={selectedModelId}
                      onValueChange={handleModelChange}
                      disabled={!selectedBrandId || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedBrandId ? t("newOrder.selectModel") : t("newOrder.selectBrandFirst")} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model._id} value={model._id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedModelId && parts.length > 0 && (
                  <div className="border rounded-md p-4 mt-4">
                    <h3 className="font-medium mb-2">{t("newOrder.availableParts")}</h3>
                    <div className="space-y-2">
                      {parts.map((part) => (
                        <div key={part._id} className="flex items-center justify-between">
                          <div>
                            <span>{part.name}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ${part.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePartQuantityChange(
                                  part._id,
                                  (selectedParts.get(part._id) || 0) - 1
                                )
                              }
                              disabled={(selectedParts.get(part._id) || 0) === 0}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {selectedParts.get(part._id) || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePartQuantityChange(
                                  part._id,
                                  (selectedParts.get(part._id) || 0) + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedParts.size > 0 && (
                      <div className="mt-4">
                        <Button onClick={addToCart} className="w-full">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("newOrder.addToOrder")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">{t("newOrder.orderSummary")}</h3>
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{item.brandName} - {item.modelName}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {item.parts.map((part, partIndex) => (
                              <div key={partIndex} className="flex justify-between text-sm">
                                <span>{part.partName} x{part.quantity}</span>
                                <span>${(part.price * part.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium text-lg pt-2">
                        <span>{t("newOrder.total")}:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("newOrder.orderNotes")}</CardTitle>
                  <CardDescription>
                    {t("newOrder.additionalInfo")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("orders.notes")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("newOrder.additionalInfo")}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orders')}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !customer || cart.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isLoading ? t("common.loading") : t("orders.createOrder")}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}