"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, User, MapPin, Building2, CheckCircle2, Loader2, Code } from "lucide-react";
import { submitRegistrationRequest } from "@/server/actions/registration.actions";
import { validateOrgNumber } from "@/server/actions/brreg.actions";

interface RegisterDialogProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function RegisterDialog({ trigger, children, onOpenChange }: RegisterDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingOrg, setIsValidatingOrg] = useState(false);
  const [orgValidated, setOrgValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEHF, setUseEHF] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    orgNumber: "",
    address: "",
    postalCode: "",
    city: "",
  });

  // Validate org number
  async function handleOrgNumberBlur(e: React.FocusEvent<HTMLInputElement>) {
    const orgNumber = e.target.value.trim();
    
    if (!orgNumber || orgNumber.length < 9) {
      setOrgValidated(false);
      return;
    }

    setIsValidatingOrg(true);
    setError(null);

    try {
      const result = await validateOrgNumber(orgNumber);

      if (result.success && result.data) {
        setOrgValidated(true);
        
        // Auto-fill company information
        setFormData({
          companyName: result.data.navn,
          orgNumber: result.data.organisasjonsnummer,
          address: result.data.forretningsadresse?.adresse?.join(", ") || "",
          postalCode: result.data.forretningsadresse?.postnummer || "",
          city: result.data.forretningsadresse?.poststed || "",
        });

        setError(null);
      } else {
        setOrgValidated(false);
        setError("❌ " + (result.error || "Business registration number not found or company is inactive"));
      }
    } catch (err) {
      console.error("Org validation error:", err);
      setOrgValidated(false);
      setError("⚠️ Could not validate business registration number. Please try again.");
    } finally {
      setIsValidatingOrg(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!orgValidated) {
      setError("❌ Please provide a valid business registration number before registering");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData(e.currentTarget);

    try {
      const result = await submitRegistrationRequest(submitData);
      
      if (result.success) {
        setOpen(false);
        router.push("/registrer-bedrift/takk");
        // Reset form
        setOrgValidated(false);
        setFormData({
          companyName: "",
          orgNumber: "",
          address: "",
          postalCode: "",
          city: "",
        });
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 overflow-hidden"  aria-describedby="register-description">
        <DialogHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 border-b pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Register your company</DialogTitle>
          <DialogDescription id="register-description" className="text-xs sm:text-sm">
            Fill out the form and we will set up your account within 24 hours. 14-day free trial.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)] px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Business registration number */}
            <div className="space-y-2">
              <Label htmlFor="orgNumber" className="text-xs sm:text-sm font-medium">
                Business Registration Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Code className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="orgNumber"
                  name="orgNumber"
                  type="text"
                  required
                  placeholder="123 456 789"
                  pattern="[0-9\s]{9,11}"
                  className="pl-10 pr-10 h-11"
                  value={formData.orgNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, orgNumber: e.target.value });
                    setOrgValidated(false);
                  }}
                  onBlur={handleOrgNumberBlur}
                  disabled={isValidatingOrg}
                />
                {isValidatingOrg && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {orgValidated && !isValidatingOrg && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                We verify that the company is registered in the official business registry
              </p>
            </div>

            {/* Company name – auto-filled */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs sm:text-sm font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="Company Inc."
                  className="pl-10 h-11"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={isValidatingOrg}
                />
              </div>
              {orgValidated && formData.companyName && (
                <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-500">
                  ✓ Retrieved from business registry
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Number of employees */}
              <div className="space-y-2">
                <Label htmlFor="employeeCount" className="text-xs sm:text-sm font-medium">
                  Number of employees <span className="text-destructive">*</span>
                </Label>
                <Select name="employeeCount" required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-20">1-20 employees</SelectItem>
                    <SelectItem value="21-50">21-50 employees</SelectItem>
                    <SelectItem value="51+">51+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-xs sm:text-sm font-medium">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select name="industry" required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Transportation and Logistics">Transportation and Logistics</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail and Service">Retail and Service</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Technology and IT">Technology and IT</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-3 sm:pt-4 md:pt-5">
              <h3 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm">Contact Person</h3>

              {/* Contact name */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <Label htmlFor="contactPerson" className="text-xs sm:text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-xs sm:text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-xs sm:text-sm font-medium">
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
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 sm:pt-4 md:pt-5">
              <h3 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm">Billing Address</h3>

              {/* Electronic invoice toggle */}
              <div className="flex items-center space-x-3 mb-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="useEHF"
                  name="useEHF"
                  checked={useEHF}
                  onCheckedChange={(checked) => setUseEHF(checked === true)}
                  value={useEHF ? "true" : "false"}
                />
                <input type="hidden" name="useEHF" value={useEHF ? "true" : "false"} />
                <div className="flex-1">
                  <Label htmlFor="useEHF" className="cursor-pointer font-medium text-sm">
                    We receive electronic invoices
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Electronic invoice (recommended)
                  </p>
                </div>
              </div>

              {/* Invoice email */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="invoiceEmail" className="text-sm font-medium">
                  Billing email {!useEHF && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invoiceEmail"
                    name="invoiceEmail"
                    type="email"
                    required={!useEHF}
                    placeholder="billing@company.com"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Postal address (only if no electronic invoice) */}
              {!useEHF && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="address" className="text-sm font-medium">
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
                        className="pl-10 h-11"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium">
                        ZIP code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        required={!useEHF}
                        placeholder="12345"
                        pattern="[0-9]{5}"
                        className="h-11"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        required={!useEHF}
                        placeholder="New York"
                        className="h-11"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  {orgValidated && formData.address && (
                    <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                      ✓ Address retrieved from business registry
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Notes/Comments */}
            <div className="space-y-2 px-1">
              <Label htmlFor="notes" className="text-sm font-medium">
                Questions or requests? (optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="E.g. demo request, special needs, etc."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg mx-1">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-muted/50 p-3 sm:p-4 rounded-lg mx-1">
              <div className="text-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">24h activation</p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">14-day trial</p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">No commitment</p>
              </div>
            </div>

            {/* Submit */}
            <div className="px-1">
              <Button
                type="submit"
                size="lg"
                className="w-full h-11"
                disabled={isSubmitting || !orgValidated || isValidatingOrg}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !orgValidated ? (
                  "Validate registration number first"
                ) : (
                  "Register company"
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground px-1">
              By registering you agree to our terms of service and privacy policy.
            </p>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
