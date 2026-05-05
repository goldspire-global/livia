import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateBusiness } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  category: z.string().min(1, "Please select a category"),
  timezone: z.string().min(1, "Please select a timezone"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBusiness = useCreateBusiness();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const watchName = form.watch("name");
  const isSlugTouched = form.formState.dirtyFields.slug;

  if (watchName && !isSlugTouched && form.getValues("slug") !== generateSlug(watchName)) {
    form.setValue("slug", generateSlug(watchName));
  }

  const onSubmit = (values: FormValues) => {
    createBusiness.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Business created",
            description: "Welcome to Bliq!",
          });
          // Redirect to dashboard to reload the businesses
          window.location.href = "/dashboard";
        },
        onError: (error) => {
          toast({
            title: "Failed to create business",
            description: (error as any).error || "An unexpected error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Set up your business</CardTitle>
          <CardDescription>
            Let's get your command center ready. You can change these details later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-muted-foreground bg-muted px-3 py-2 text-sm border border-r-0 border-input rounded-l-md">
                          bliq.com/b/
                        </span>
                        <Input className="rounded-l-none" placeholder="acme-studio" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is the link you'll share with clients.
                    </FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="barbershop">Barbershop</SelectItem>
                        <SelectItem value="salon">Hair Salon</SelectItem>
                        <SelectItem value="tattoo">Tattoo Studio</SelectItem>
                        <SelectItem value="massage">Massage Therapy</SelectItem>
                        <SelectItem value="fitness">Personal Training</SelectItem>
                        <SelectItem value="medical">Medical Spa</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        {/* More timezones can be added */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={createBusiness.isPending}>
                {createBusiness.isPending ? "Creating..." : "Create Business"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
