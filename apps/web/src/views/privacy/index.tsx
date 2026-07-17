import { LegalShell } from "@/components/legal-shell"
import { siteConfig } from "@/configs/site-config"

export const PrivacyView = () => {
  return (
    <LegalShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Introduction</h2>
          <p className="text-muted-foreground">
            This Privacy Policy describes how {siteConfig.brand.name}{" "}
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
            and protects information when you use our browser extension and
            companion website. This is placeholder content and should be
            replaced with your actual privacy practices.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Information We Collect
          </h2>
          <p className="text-muted-foreground">
            Describe here what data your extension or website collects, such as
            usage analytics, device information, or user preferences.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How We Use Information
          </h2>
          <p className="text-muted-foreground">
            Explain how the collected information is used, e.g. to provide and
            improve the service, respond to support requests, or ensure
            security.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Cookies &amp; Tracking
          </h2>
          <p className="text-muted-foreground">
            Describe any cookies, local storage, or similar tracking
            technologies used by the website or extension.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            List any third-party services (analytics, hosting, error tracking)
            that may process user data on your behalf.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Data Retention
          </h2>
          <p className="text-muted-foreground">
            Explain how long data is retained and how users can request deletion
            of their information.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Your Rights</h2>
          <p className="text-muted-foreground">
            Describe user rights regarding their data, such as access,
            correction, or deletion requests, depending on applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Changes to This Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, contact us at{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="text-foreground underline underline-offset-4"
            >
              {siteConfig.links.email}
            </a>
            .
          </p>
        </section>
      </div>
    </LegalShell>
  )
}
