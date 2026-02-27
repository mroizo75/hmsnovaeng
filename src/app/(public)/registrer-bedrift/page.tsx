"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ArrowLeft, Building2, Mail, Phone, User, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitRegistrationRequest } from "@/server/actions/registration.actions";

export default function RegistrerBedriftPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEHF, setUseEHF] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitRegistrationRequest(formData);
      
      if (result.success) {
        router.push("/registrer-bedrift/takk");
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <Badge variant="secondary" className="mb-4">
              Register company
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Request access to EHS Nova</h1>
            <p className="text-lg text-muted-foreground">
              Fill out the form below and we will contact you within 24 hours to activate your account.
              All plans include a 14-day free trial period.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Company information</CardTitle>
              <CardDescription>
                We need this information to set up your account and billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      placeholder="Acme Inc."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* EIN/Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="orgNumber">
                    EIN / Tax ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="orgNumber"
                    name="orgNumber"
                    type="text"
                    required
                    placeholder="12-3456789"
                    pattern="[0-9\-]{9,11}"
                  />
                  <p className="text-xs text-muted-foreground">9 digits (XX-XXXXXXX format)</p>
                </div>

                {/* Number of employees */}
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">
                    Number of employees <span className="text-destructive">*</span>
                  </Label>
                  <Select name="employeeCount" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-20">1–20 employees</SelectItem>
                      <SelectItem value="21-50">21–50 employees</SelectItem>
                      <SelectItem value="51+">51+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <Select name="industry" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Transport and logistics">Transport and logistics</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail and services">Retail and services</SelectItem>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Technology and IT">Technology and IT</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Contact person</h3>

                  {/* Contact person name */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="contactPerson">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        type="text"
                        required
                        placeholder="John Smith"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="contactEmail">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        required
                        placeholder="john@company.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for login and important notifications
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        required
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Billing address</h3>

                  {/* E-invoice Toggle */}
                  <div className="flex items-center space-x-2 mb-4 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="useEHF"
                      checked={useEHF}
                      onCheckedChange={(checked) => setUseEHF(checked === true)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="useEHF" className="cursor-pointer font-medium">
                        We receive electronic invoices
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Electronic invoice directly in accounting system (recommended)
                      </p>
                    </div>
                  </div>

                  {/* Invoice email (always visible as backup) */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="invoiceEmail">
                      Email for invoice {!useEHF && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invoiceEmail"
                        name="invoiceEmail"
                        type="email"
                        required={!useEHF}
                        placeholder="accounting@company.com"
                        className="pl-10"
                      />
                    </div>
                    {useEHF && (
                      <p className="text-xs text-muted-foreground">
                        Used as backup if electronic invoice fails
                      </p>
                    )}
                  </div>

                  {/* Address (only if not electronic invoice) */}
                  {!useEHF && (
                    <>
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="address">
                          Street address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="address"
                            name="address"
                            type="text"
                            required={!useEHF}
                            placeholder="123 Main St"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">
                            ZIP code <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            required={!useEHF}
                            placeholder="12345"
                            pattern="[0-9]{5}(-[0-9]{4})?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">
                            City <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            required={!useEHF}
                            placeholder="New York"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Message/Comment */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Any questions or requests? (optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="E.g. demo request, special needs, etc."
                    rows={4}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit application"}
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button type="button" variant="outline" size="lg" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form you agree to our{" "}
                  <Link href="/vilkar" className="underline">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/personvern" className="underline">
                    privacy policy
                  </Link>
                  .
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Fast activation</h3>
                <p className="text-xs text-muted-foreground">
                  We set up your account within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">14-day trial period</h3>
                <p className="text-xs text-muted-foreground">
                  Test all features with no commitment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Personal follow-up</h3>
                <p className="text-xs text-muted-foreground">
                  We help you get started
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
