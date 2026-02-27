"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BcmHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Help about BCM</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What is BCM (Business Continuity Management)?</DialogTitle>
          <DialogDescription>
            ISO 22301: Business Continuity Management System (BCMS)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📋 Purpose</h3>
              <p className="text-sm text-muted-foreground">
                BCM ensures that your company can continue to deliver critical services and products
                even during unforeseen events such as fire, power outages, cyberattacks, pandemics, or
                natural disasters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">📄 What should the BCM plan contain?</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-foreground">1. Critical processes and services</h4>
                  <p className="text-muted-foreground">
                    Identify which processes are essential to operations (e.g. production,
                    IT systems, customer service, supply chains).
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">2. Dependencies and resources</h4>
                  <p className="text-muted-foreground">
                    Map key personnel, suppliers, equipment, facilities and IT systems that are
                    necessary for critical processes.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">3. Risk assessment (BIA)</h4>
                  <p className="text-muted-foreground">
                    Conduct a Business Impact Analysis (BIA) to assess the consequences of
                    operational disruptions and acceptable downtime (RTO - Recovery Time Objective).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">4. Recovery strategies</h4>
                  <p className="text-muted-foreground">
                    Describe concrete measures to restore operations, including backup solutions,
                    alternative workplaces and contingency solutions.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">5. Crisis handbook and response team</h4>
                  <p className="text-muted-foreground">
                    Define roles and responsibilities, contact lists (24/7 on-call), notification procedures and
                    escalation plan during a crisis.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">6. Communication plan</h4>
                  <p className="text-muted-foreground">
                    How to inform employees, customers, suppliers, media and authorities during an
                    incident?
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">7. Exercises and testing</h4>
                  <p className="text-muted-foreground">
                    Schedule regular BCM exercises (tabletop exercises, simulation, full-scale test) to
                    verify that the plan works.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">🔥 Examples of emergency situations</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• <strong>Fire:</strong> Evacuation and temporary workplace</li>
                <li>• <strong>IT outage:</strong> Backup systems and data recovery</li>
                <li>• <strong>Pandemic:</strong> Remote work and reduced staffing</li>
                <li>• <strong>Supplier failure:</strong> Alternative suppliers</li>
                <li>• <strong>Power outage:</strong> Emergency power and manual operations</li>
                <li>• <strong>Cyberattack:</strong> IT security and recovery</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">🔄 The PDCA cycle in BCM</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-foreground">Plan:</strong>
                  <span className="text-muted-foreground ml-2">
                    Identify risks, critical processes and create BCM plan
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Do:</strong>
                  <span className="text-muted-foreground ml-2">
                    Implement measures, train personnel and conduct exercises
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Check:</strong>
                  <span className="text-muted-foreground ml-2">
                    Evaluate exercises, test backups and review the plan annually
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Act:</strong>
                  <span className="text-muted-foreground ml-2">
                    Update the plan based on lessons learned and changes in the organization
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-blue-900">💡 Tips to get started</h3>
              <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                <li>Start by identifying 3-5 critical processes in your company</li>
                <li>Conduct a simple BIA (Business Impact Analysis)</li>
                <li>Create a contact list for crisis team and key personnel</li>
                <li>Document backup solutions for IT, facilities and equipment</li>
                <li>Plan a simple tabletop exercise to test the plan</li>
                <li>Update the plan at least once a year</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
