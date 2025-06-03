import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserCog, Mail, Bell, Shield, Database, Save, Globe } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

// Form schema for user settings
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Form schema for notification settings
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Form schema for appearance settings
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  compactMode: z.boolean().default(false),
});

// Form schema for language settings
const languageFormSchema = z.object({
  language: z.string(),
});

export function SettingsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);

  // Setup profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    }
  });

  // Setup notification form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      orderUpdates: true,
      marketingEmails: false,
    }
  });

  // Setup appearance form
  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      compactMode: false,
    }
  });

  // Setup language form
  const languageForm = useForm<z.infer<typeof languageFormSchema>>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      language: language,
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { user } = await getCurrentUser();
        setUser(user);

        // Set profile form values
        profileForm.reset({
          name: user.name,
          email: user.email,
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast, profileForm]);

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);

      // In a real app, this would make an API call to update user profile
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: z.infer<typeof notificationFormSchema>) => {
    try {
      // In a real app, this would make an API call to update notification settings
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been updated"
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  const onAppearanceSubmit = async (data: z.infer<typeof appearanceFormSchema>) => {
    try {
      // In a real app, this would update appearance settings
      toast({
        title: "Appearance Updated",
        description: "Your appearance settings have been updated"
      });
    } catch (error) {
      console.error("Error updating appearance:", error);
      toast({
        title: "Error",
        description: "Failed to update appearance settings",
        variant: "destructive"
      });
    }
  };

  const onLanguageSubmit = async (data: z.infer<typeof languageFormSchema>) => {
    try {
      setLanguage(data.language);
      toast({
        title: t("settings.languageUpdated"),
        description: t("settings.languageUpdatedDescription")
      });
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: "Error",
        description: "Failed to update language settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <UserCog className="mr-2 h-4 w-4" />
            {t("settings.profile")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            {t("settings.notifications")}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Shield className="mr-2 h-4 w-4" />
            {t("settings.appearance")}
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className="mr-2 h-4 w-4" />
            {t("settings.language")}
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="system">
              <Database className="mr-2 h-4 w-4" />
              {t("settings.system")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile")}</CardTitle>
              <CardDescription>
                {t("settings.manageProfile")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("customers.name")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("customers.email")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? t("settings.saving") : t("settings.saveChanges")}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">{t("settings.accountInfo")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.role")}</span>
                    <span className="font-medium capitalize">{user?.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.branch")}</span>
                    <span className="font-medium">Main Branch</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.accountCreated")}</span>
                    <span className="font-medium">January 15, 2023</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {t("settings.configureNotifications")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t("settings.emailNotifications")}</FormLabel>
                          <FormDescription>
                            {t("settings.receiveEmail")}
                          </FormDescription>
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

                  <FormField
                    control={notificationForm.control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t("settings.smsNotifications")}</FormLabel>
                          <FormDescription>
                            {t("settings.receiveSMS")}
                          </FormDescription>
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

                  <FormField
                    control={notificationForm.control}
                    name="orderUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t("settings.orderUpdates")}</FormLabel>
                          <FormDescription>
                            {t("settings.receiveOrderUpdates")}
                          </FormDescription>
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

                  <FormField
                    control={notificationForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t("settings.marketingEmails")}</FormLabel>
                          <FormDescription>
                            {t("settings.receiveMarketing")}
                          </FormDescription>
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

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {t("settings.savePreferences")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance")}</CardTitle>
              <CardDescription>
                {t("settings.customizeAppearance")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.theme")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("settings.selectTheme")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">{t("settings.light")}</SelectItem>
                            <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                            <SelectItem value="system">{t("settings.system")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("settings.selectTheme")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appearanceForm.control}
                    name="compactMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel>{t("settings.compactMode")}</FormLabel>
                          <FormDescription>
                            {t("settings.useCompactMode")}
                          </FormDescription>
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

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {t("settings.saveAppearance")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>
                {t("settings.selectLanguage")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...languageForm}>
                <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-4">
                  <FormField
                    control={languageForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.language")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("settings.selectLanguage")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'admin' && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.systemSettings")}</CardTitle>
                <CardDescription>
                  {t("settings.configureSystem")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{t("settings.databaseBackup")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.configureBackups")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline">{t("settings.configureBackupsBtn")}</Button>
                        <Button variant="secondary">{t("settings.manualBackup")}</Button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <h3 className="text-lg font-medium">{t("settings.emailTemplates")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.customizeTemplates")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline">{t("settings.editTemplates")}</Button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <h3 className="text-lg font-medium">{t("settings.systemLogs")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.viewDownloadLogs")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline">{t("settings.viewLogs")}</Button>
                        <Button variant="secondary">{t("settings.downloadLogs")}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}