import { LegalShell } from "@/components/legal-shell"
import { siteConfig } from "@/configs/site-config"

export const TermsView = () => {
  return (
    <LegalShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Acceptance of Terms
          </h2>
          <p className="text-muted-foreground">
            By installing or using {siteConfig.brand.name}, you agree to be
            bound by these Terms of Service. This is placeholder content and
            should be replaced with your actual terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Use of Service
          </h2>
          <p className="text-muted-foreground">
            Describe the acceptable use policy for your extension and website,
            including any restrictions on usage.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            Describe ownership of the service, trademarks, and any content
            provided through the extension or website.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Disclaimers</h2>
          <p className="text-muted-foreground">
            The service is provided &quot;as is&quot; without warranties of any
            kind, either express or implied.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            Describe the limits of liability for damages arising from use of the
            service, to the extent permitted by law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Termination</h2>
          <p className="text-muted-foreground">
            Describe the conditions under which access to the service may be
            suspended or terminated.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Changes to Terms
          </h2>
          <p className="text-muted-foreground">
            We may update these Terms of Service from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms of Service, contact us at{" "}
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
