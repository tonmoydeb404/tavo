/**
 * Renders a JSON-LD `<script>` tag for structured data.
 *
 * Place inside any Server Component to emit schema.org markup that Google,
 * Bing, and AI search engines (ChatGPT, Perplexity, Claude) use to cite
 * and surface content.
 */
type JsonLdProps = {
  /** A schema.org object (e.g. FAQPage, WebApplication, Organization). */
  schema: object
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
