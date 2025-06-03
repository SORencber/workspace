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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  PlusCircle,
  Search,
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Pencil,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/useToast";
import { getBranches, createBranch, updateBranch, BranchType } from "@/api/branches";
import { getCurrentUser } from "@/api/users";
import { useTranslation } from "react-i18next";
import { useServerPort } from "@/utils/serverPort";

// Form schema for branch creation/editing
const branchFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  manager: z.string().min(2, {
    message: "Manager name must be at least 2 characters.",
  }),
  active: z.boolean().default(true)
});

export function BranchesPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected } = useServerPort();
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);

  // Setup form
  const form = useForm<z.infer<typeof branchFormSchema>>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      manager: "",
      active: true
    }
  });

  const fetchData = useCallback(async () => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if user is admin
      const { user } = await getCurrentUser();
      setIsAdmin(user.role === 'admin');

      // Fetch branches
      const { branches } = await getBranches();
      setBranches(branches);
      setRetryCount(0); // Reset retry count on successful fetch
      setDataFetched(true);
    } catch (error: any) {
      console.error("Failed to fetch branches:", error);
      setError(error?.message || "Failed to fetch branches");
      toast({
        title: "Error",
        description: "Failed to fetch branches. Will retry in a moment.",
        variant: "destructive"
      });

      // Only increment retry count if there was an actual error
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [toast, isConnected]);

  useEffect(() => {
    if (!dataFetched) {
      fetchData();
    }
  }, [fetchData, dataFetched]);

  // Only retry a reasonable number of times to avoid infinite loops
  useEffect(() => {
    if (retryCount > 0 && retryCount < 5 && isConnected && !dataFetched) {
      const timer = setTimeout(() => {
        fetchData();
      }, 3000); // 3 second delay between retries

      return () => clearTimeout(timer);
    }
  }, [retryCount, fetchData, isConnected, dataFetched]);

  const handleSearch = () => {
    // This would typically involve an API call with search parameters
    // For now, we'll just filter the existing data
    if (!searchTerm.trim()) {
      fetchData();
      return;
    }
  };

  const openCreateDialog = () => {
    form.reset({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      manager: "",
      active: true
    });
    setIsEditMode(false);
    setCurrentBranchId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (branch: BranchType) => {
    form.reset({
      name: branch.name,
      address: branch.address,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
      manager: branch.manager,
      active: branch.active
    });
    setIsEditMode(true);
    setCurrentBranchId(branch._id);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof branchFormSchema>) => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Cannot save while disconnected from server.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && currentBranchId) {
        // Update existing branch
        const { branch } = await updateBranch(currentBranchId, data);

        // Update local state
        setBranches(branches.map(b => b._id === currentBranchId ? branch : b));

        toast({
          title: "Branch Updated",
          description: "Branch has been updated successfully"
        });
      } else {
        // Create new branch
        const { branch } = await createBranch(data);

        // Update local state
        setBranches([...branches, branch]);

        toast({
          title: "Branch Created",
          description: "Branch has been created successfully"
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to save branch:", error);
      setError(error?.message || "Failed to save branch");
      toast({
        title: "Error",
        description: "Failed to save branch",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setDataFetched(false);
    fetchData();
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("branches.title")}</h1>
        {isAdmin && (
          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("branches.addBranch")}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("branches.branchManagement")}</CardTitle>
              <CardDescription>
                {t("branches.description")}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              placeholder={t("branches.searchBranches")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isConnected ? (
            <div className="text-center py-10">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Cannot connect to server</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-10">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("branches.noBranches")}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("branches.name")}</TableHead>
                    <TableHead>{t("branches.manager")}</TableHead>
                    <TableHead>{t("branches.phone")}</TableHead>
                    <TableHead>{t("branches.address")}</TableHead>
                    <TableHead>{t("branches.status")}</TableHead>
                    {isAdmin && <TableHead>{t("common.actions")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {branch.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {branch.manager}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {branch.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {branch.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          branch.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {branch.active ? t("common.active") : t("common.inactive")}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(branch)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t("branches.editBranch") : t("branches.addBranch")}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? t("branches.editBranchDescription")
                : t("branches.addBranchDescription")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("branches.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("branches.enterName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("branches.manager")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("branches.enterManager")} {...field} />
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
                    <FormLabel>{t("branches.phone")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("branches.enterPhone")} {...field} />
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
                    <FormLabel>{t("branches.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("branches.enterEmail")} {...field} />
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
                    <FormLabel>{t("branches.address")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("branches.enterAddress")}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("branches.active")}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {t("branches.activeDescription")}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
                  ) : isEditMode ? (
                    t("branches.saveBranch")
                  ) : (
                    t("branches.createBranch")
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