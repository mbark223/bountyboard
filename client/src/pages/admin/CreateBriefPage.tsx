import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createBrief } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const briefSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  orgName: z.string().min(2, "Organization name is required"),
  overview: z.string().min(20, "Overview must be at least 20 characters"),
  requirements: z.array(z.object({ value: z.string().min(1, "Requirement cannot be empty") })),
  deliverables: z.object({
    ratio: z.string().min(1, "Aspect ratio is required"),
    length: z.string().min(1, "Length is required"),
    format: z.string().min(1, "Format is required"),
  }),
  reward: z.object({
    type: z.enum(["CASH", "BONUS_BETS", "OTHER"]),
    amount: z.string().min(1, "Amount is required"),
    currency: z.string().default("USD"),
    description: z.string().optional(),
  }),
  deadline: z.string().min(1, "Deadline is required"),
});

type BriefFormValues = z.infer<typeof briefSchema>;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CreateBriefPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      title: "",
      orgName: "",
      overview: "",
      requirements: [{ value: "" }, { value: "" }, { value: "" }],
      deliverables: {
        ratio: "9:16 (Vertical)",
        length: "15-30 seconds",
        format: "MP4 / 1080p",
      },
      reward: {
        type: "CASH",
        amount: "",
        currency: "USD",
        description: "",
      },
      deadline: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "requirements",
    control: form.control,
  });

  const createMutation = useMutation({
    mutationFn: createBrief,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefs"] });
      toast({
        title: "Brief Created",
        description: "Your brief has been published successfully.",
      });
      setLocation("/admin/briefs");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brief. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: BriefFormValues) {
    const slug = generateSlug(data.title);
    const requirements = data.requirements.map(r => r.value).filter(v => v.length > 0);
    
    createMutation.mutate({
      slug,
      title: data.title,
      orgName: data.orgName,
      overview: data.overview,
      requirements,
      deliverableRatio: data.deliverables.ratio,
      deliverableLength: data.deliverables.length,
      deliverableFormat: data.deliverables.format,
      rewardType: data.reward.type,
      rewardAmount: data.reward.amount,
      rewardCurrency: data.reward.currency,
      rewardDescription: data.reward.description,
      deadline: new Date(data.deadline),
      status: "PUBLISHED",
    });
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary" onClick={() => setLocation("/admin/briefs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Create New Brief</h1>
            <p className="text-muted-foreground">Define the requirements and bounty for your new campaign.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about the campaign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Vibes 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orgName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization / Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Glow Energy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overview</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you're looking for..." 
                          className="resize-y min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Requirements & Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Deliverables</CardTitle>
                <CardDescription>What exactly do the creators need to submit?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Key Requirements (Bullet points)</h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => append({ value: "" })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`requirements.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder={`Requirement ${index + 1}`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="deliverables.ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ratio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9:16 (Vertical)">9:16 (Vertical)</SelectItem>
                            <SelectItem value="16:9 (Landscape)">16:9 (Landscape)</SelectItem>
                            <SelectItem value="1:1 (Square)">1:1 (Square)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="deliverables.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 15-30s" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="deliverables.format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. MP4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bounty / Reward */}
            <Card>
              <CardHeader>
                <CardTitle>Bounty & Reward</CardTitle>
                <CardDescription>Set the incentive for this brief.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reward.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">Cash Payment</SelectItem>
                            <SelectItem value="BONUS_BETS">Bonus Bets</SelectItem>
                            <SelectItem value="OTHER">Other / Product</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="reward.amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount / Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 500" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter numeric value or text description.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="reward.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Paid via PayPal within 30 days" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-12">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/briefs")}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Publish
                  </>
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
