import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

import { SectionHeading } from "@/views/extension/components"

export type Faq = {
  question: string
  answer: string
}

export const faqs: Faq[] = [
  {
    question: "Which Macs and macOS versions are supported?",
    answer:
      "Currently Apple Silicon Macs. Switching devices and muting your mic work on any supported macOS version. Per-app audio routing needs macOS 14.2 or later, and is hidden on older versions.",
  },
  {
    question: "How is this different from the browser extension?",
    answer:
      "The extension controls audio per tab inside Chrome, Edge, and Brave. The Mac app controls audio across your whole system — devices, your mic, and any app. They are independent, so you can use either or both.",
  },
  {
    question: "How does per-app audio routing work?",
    answer:
      "Tavo uses Core Audio process taps, Apple's official API for capturing an app's audio. It mutes the app's normal output and plays it through the device you chose instead. The first time, macOS asks you to allow audio capture.",
  },
  {
    question: "Can it mute my mic with a hotkey?",
    answer:
      "Yes. Mute and unmute from the menu bar or with a global hotkey that works while any app is in focus. Tavo changes the device's mute state directly, so every app sees the mic as muted.",
  },
  {
    question: "Does Tavo record or collect my audio?",
    answer:
      "No. Routing passes audio straight to the output device you picked and nothing is recorded, stored, or sent anywhere. There are no accounts and no servers.",
  },
  {
    question:
      "Why does macOS warn that the app is from an unidentified developer?",
    answer:
      "Tavo isn't notarized with Apple yet. The installer script removes the quarantine flag for you. If you installed the .dmg by hand, right-click the app and choose Open the first time. The source is public if you want to check it.",
  },
  {
    question: "Is it free? What about Windows and Linux?",
    answer:
      "Tavo is free and open source. The features here rely on macOS audio APIs, so the app is macOS-only for now.",
  },
]

function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
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

export { FaqSection }
