"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/animate-ui/radix/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <span>Privacy</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              How we collect, use, and protect your personal data in compliance
              with the GDPR.
            </p>
            <p>
              We may update this privacy policy. Significant changes will be
              announced on this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="font-bold">August 16, 2025</span>
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Data Controller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="font-bold">mnsy.dev</p>
              <p>
                Contact:{" "}
                <a className="underline" href="mailto:me@mnsy.dev">
                  me@mnsy.dev
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. What Data We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email address - required to create an account and log in via
                  magic links.
                </li>
                <li>
                  IP address (encrypted) - used temporarily for security and
                  rate-limiting.
                </li>
                <li>
                  Site preferences - optional settings you choose (e.g. display
                  preferences).
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  To provide account login and authentication (magic links sent
                  to your email).
                </li>
                <li>
                  To protect the service against abuse (rate-limiting by
                  encrypted IP).
                </li>
                <li>To save and apply your site preferences.</li>
                <li>We do not use your email for marketing or newsletters.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Legal Bases for Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Performance of a contract (GDPR Art. 6(1)(b)): providing login
                  via email.
                </li>
                <li>
                  Legitimate interest (GDPR Art. 6(1)(f)): ensuring site
                  security and preventing abuse.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Emails - stored until you delete your account or after 12
                  months of inactivity.
                </li>
                <li>
                  Encrypted IPs - stored only as long as necessary for rate
                  limiting, no longer than 12 months.
                </li>
                <li>Preferences - stored until your account is deleted.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>We use trusted service providers to deliver our services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Mailersend (USA) - for sending login emails. Data transfers
                  are protected under the EU-US Data Privacy Framework.
                </li>
                <li>Hetzner Hosting Provider - located in the EU.</li>
              </ul>
              <p>
                We do not sell or share your data with third parties for
                advertising.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you.</li>
                <li>Correct or update your data.</li>
                <li>
                  Request deletion of your data (“right to be forgotten”).
                </li>
                <li>Request a copy of your data in a portable format.</li>
                <li>Object to or restrict certain processing.</li>
              </ul>
              <p>
                To exercise your rights, please open a support ticket via the{" "}
                {""}
                <Link href="/support" className="underline">
                  support page
                </Link>{" "}
                or contact us at{" "}
                <a className="underline" href="mailto:me@mnsy.dev">
                  me@mnsy.dev
                </a>
                .
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You also have the right to lodge a complaint with your local
                data protection authority.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
