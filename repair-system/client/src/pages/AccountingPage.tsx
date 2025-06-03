import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { useToast } from "@/hooks/useToast";
import { getBranchAccountingEntries, createAccountingEntry, getBranchSummary, AccountingEntryType, AccountingSummaryType } from "@/api/accounting";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus } from "lucide-react";

// Form schema for accounting entry
const entryFormSchema = z.object({
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Please select a type.",
  }),
  category: z.enum(["repair", "parts", "salary", "rent", "utilities", "other"], {
    required_error: "Please select a category.",
  })
});

export function AccountingPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<AccountingEntryType[]>([]);
  const [summary, setSummary] = useState<AccountingSummaryType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Setup form
  const form = useForm<z.infer<typeof entryFormSchema>>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      type: "income",
      category: "repair"
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { user } = await getCurrentUser();
        setUser(user);

        // Get accounting entries for user's branch
        const { entries } = await getBranchAccountingEntries(user.branchId);
        setEntries(entries);

        // Get accounting summary
        const { summary } = await getBranchSummary(user.branchId);
        setSummary(summary);
      } catch (error) {
        console.error("Error fetching accounting data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch accounting data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (data: z.infer<typeof entryFormSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const entryData = {
        ...data,
        branchId: user.branchId,
        createdBy: user._id
      };

      const { entry } = await createAccountingEntry(entryData);
      
      // Update entries list
      setEntries([entry, ...entries]);

      // Update summary
      if (summary) {
        const updatedSummary = { ...summary };
        if (data.type === 'income') {
          updatedSummary.income += data.amount;
        } else {
          updatedSummary.expense += data.amount;
        }
        updatedSummary.balance = updatedSummary.income - updatedSummary.expense;
        updatedSummary.entryCount += 1;
        updatedSummary.lastUpdated = new Date().toISOString();
        setSummary(updatedSummary);
      }

      setIsDialogOpen(false);
      form.reset({
        amount: 0,
        description: "",
        type: "income",
        category: "repair"
      });

      toast({
        title: "Success",
        description: "Accounting entry created successfully"
      });
    } catch (error) {
      console.error("Error creating accounting entry:", error);
      toast({
        title: "Error",
        description: "Failed to create accounting entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${summary.income.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total income recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${summary.expense.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total expenses recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current balance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accounting Entries</CardTitle>
          <CardDescription>
            Recent income and expense entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No accounting entries found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="capitalize">{entry.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {entry.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right ${
                        entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${entry.amount.toFixed(2)}
                      </TableCell>
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
            <DialogTitle>Add New Entry</DialogTitle>
            <DialogDescription>
              Create a new accounting entry for income or expense
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Income
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Expense
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <Input type="number" step="0.01" min="0" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="parts">Parts</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for this entry"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Add Entry"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}