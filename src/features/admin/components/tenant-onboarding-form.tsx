"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PricingTier } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTenant } from "@/server/actions/tenant.actions";
import { useToast } from "@/hooks/use-toast";
import {
  PRICING_PLANS,
  SUPPORTED_INDUSTRIES,
  calculatePricingTier,
  getPricingPlan,
  ONBOARDING_STEPS,
  COMPETITIVE_ADVANTAGES,
} from "@/lib/pricing";
import {
  Building2,
  Users,
  Euro,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const tenantOnboardingSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  orgNumber: z.string().optional(),
  contactPerson: z.string().min(2, "Contact person is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  employeeCount: z.number().min(1, "Number of employees must be at least 1"),
  industry: z.string(),
  notes: z.string().optional(),
});

type TenantOnboardingFormData = z.infer<typeof tenantOnboardingSchema>;

interface TenantOnboardingFormProps {
  salesRep: string;
}

export function TenantOnboardingForm({ salesRep }: TenantOnboardingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number>(5);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("other");
  const [selectedTier, setSelectedTier] = useState<PricingTier>("MICRO");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TenantOnboardingFormData>({
    resolver: zodResolver(tenantOnboardingSchema),
    defaultValues: {
      employeeCount: 5,
      industry: "other",
    },
  });

  // Beregn pricing tier dynamisk (kan overstyres manuelt)
  const currentTier = selectedTier;
  const currentPlan = getPricingPlan(currentTier);

  const onSubmit = async (data: TenantOnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createTenant({
        ...data,
        salesRep,
        pricingTier: currentTier,
        createInFiken: false, // Kan legges til som checkbox senere
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
title: "Company created! 🎉",
        description: `${data.name} has been registered in the system.`,
        });
        router.push("/admin/tenants");
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create company",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            Company info
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <Euro className="mr-2 h-4 w-4" />
            Price & Plan
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="advantage">
            <Sparkles className="mr-2 h-4 w-4" />
            Competitive advantages
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Bedriftsinformasjon */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
              <CardDescription>
                Fill in the company contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Company name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Acme AS"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgNumber">Org. number</Label>
                  <Input
                    id="orgNumber"
                    {...register("orgNumber")}
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    {...register("contactPerson")}
                    placeholder="Ola Nordmann"
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-500">
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      type="email"
                      {...register("contactEmail")}
                      placeholder="info@company.com"
                      className="pl-10"
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactPhone"
                      {...register("contactPhone")}
                      placeholder="12345678"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">
                    Number of employees <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employeeCount"
                      type="number"
                      {...register("employeeCount", { valueAsNumber: true })}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setEmployeeCount(value);
                        setValue("employeeCount", value);
                      }}
                      placeholder="5"
                      className="pl-10"
                    />
                  </div>
                  {errors.employeeCount && (
                    <p className="text-sm text-red-500">
                      {errors.employeeCount.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Gateveien 1"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder="0123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} placeholder="Oslo" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedIndustry}
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
                    setValue("industry", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{industry.label}</span>
                          <Badge variant="outline" className="ml-2">
                            {industry.templates} templates
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">CRM notes (internal)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Internal notes about the customer, meetings, agreements, etc..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Pricing & Plan */}
        <TabsContent value="pricing" className="space-y-6">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Select pricing plan:</strong> Choose the desired pricing plan for the customer. Default is MICRO (NOK 3,300/year).
            </AlertDescription>
          </Alert>

          {/* Velg Pricing Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Select subscription plan</CardTitle>
              <CardDescription>
                Choose which plan the customer should have
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="pricingTier">
                  Pricing plan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedTier}
                  onValueChange={(value) => setSelectedTier(value as PricingTier)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MICRO">MICRO - EHS Nova Software ($399/year)</SelectItem>
                    <SelectItem value="SMALL">SMALL - EHS Nova Software ($399/year)</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM - EHS Nova Software ($399/year)</SelectItem>
                    <SelectItem value="LARGE">LARGE - Enterprise (contact for pricing)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All plans have the same price and features (NOK 3,300/year with 1 year commitment)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Valgt plan */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected plan</CardTitle>
                  <Badge className="bg-primary">{currentPlan.name}</Badge>
                </div>
                <CardDescription>{currentPlan.employeeRange}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {currentPlan.yearlyPrice.toLocaleString("en-US")} NOK
                    </span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Or {currentPlan.monthlyPrice.toLocaleString("en-US")} NOK/month
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-semibold">Included in plan:</h4>
                  <ul className="space-y-1 text-sm">
                    {currentPlan.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {currentPlan.features.length > 5 && (
                      <li className="text-muted-foreground">
                        + {currentPlan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Popular features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentPlan.popularFeatures.map((feature, i) => (
                      <Badge key={i} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alle planer */}
            <Card>
              <CardHeader>
                <CardTitle>All plans</CardTitle>
                <CardDescription>
                  Overview of prices based on company size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {PRICING_PLANS.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`p-4 rounded-lg border ${
                      plan.tier === currentTier
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.employeeRange}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {plan.yearlyPrice.toLocaleString("en-US")} NOK
                        </p>
                        <p className="text-xs text-muted-foreground">/year</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Onboarding */}
        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding process</CardTitle>
              <CardDescription>
                Guide for getting started with HMS Nova 2.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{step.title}</h4>
                        <Badge variant="outline">{step.estimatedTime}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Total estimated time:</strong> 5-6 hours spread over the first week.
                  We recommend taking it step by step!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Konkurransefortrinn */}
        <TabsContent value="advantage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why HMS Nova 2.0 is better than the competition</CardTitle>
              <CardDescription>
                Comparison with other EHS systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {COMPETITIVE_ADVANTAGES.map((advantage, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{advantage.feature}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">HMS Nova 2.0:</p>
                        <p className="font-medium">{advantage.hmsNova}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Other EHS systems:</p>
                        <p>{advantage.gronnJobb}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {advantage.advantage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6 border-primary">
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Summary:</strong> HMS Nova 2.0 offers 10+ unique features that
                  competitors don't have, combined with better UX and lower price for small companies.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? "Creating..." : "Create company"}
        </Button>
      </div>
    </form>
  );
}

