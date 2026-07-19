import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

import { SectionHeading } from "@/views/home/components"

type Faq = {
  question: string
  answer: string
}

const faqs: Faq[] = [
  {
    question: "How do I mute a tab in Chrome?",
    answer:
      "Install Audio Tuner, click its toolbar icon to open the popup, then click the speaker icon next to any tab. That tab is muted instantly while every other tab keeps its audio. You can also right-click a tab in Chrome's tab bar and choose Mute Site, but Audio Tuner gives you a dedicated button per tab in a single mixer view.",
  },
  {
    question: "Can I mute a tab without pausing it?",
    answer:
      "Yes. Muting only silences the audio — the tab keeps playing in the background. A muted YouTube video keeps your playback position, a muted Google Meet keeps the call live, and a muted ad finishes its run silently. You can un-mute later and pick up where you were.",
  },
  {
    question: "Does muting affect WebRTC calls like Meet, Zoom, and Teams?",
    answer:
      "Yes. Audio Tuner applies mute through the browser's native tab-mute API, which silences all audio in the tab including WebRTC streams. This is useful for temporarily quieting a meeting while you take a side call, but note it mutes what you hear — not your microphone.",
  },
  {
    question: "Is there a keyboard shortcut to mute tabs?",
    answer:
      "Chrome does not ship a default keyboard shortcut for per-tab mute. With Audio Tuner, muting is one click on the pinned toolbar icon plus one click on the speaker for the tab you want silent. You can also assign a custom Chrome extension shortcut in chrome://extensions/shortcuts to open the popup faster.",
  },
  {
    question: "Can I mute multiple tabs at once?",
    answer:
      "Yes. Open the Audio Tuner popup and click the speaker icon on each tab you want muted. The mixer shows every open tab in one panel, so you can silence several noisy tabs in seconds and unmute them just as fast.",
  },
  {
    question: "Will the tab stay muted if I reload the page?",
    answer:
      "If Chrome's native per-site mute is in effect it persists across reloads. Audio Tuner's session-level mute state is per browser session — when you close the browser, mute state resets. For a permanent 'always silent' rule on a noisy site, right-click the tab and choose Mute Site.",
  },
]

function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Tab-mute questions, answered"
        description="Everything you might want to know before you install."
      />

      <Accordion className="mt-12">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`item-${index}`}>
            <AccordionTrigger className="text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export { FaqSection, faqs }
