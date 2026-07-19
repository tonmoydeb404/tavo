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
    question: "How do I mute my mic in a browser tab?",
    answer:
      "Open Audio Tuner’s popup and flip the mic toggle for that tab. The tab loses access to your microphone until you turn it back on — no digging through the site’s settings.",
  },
  {
    question: "Does it work with Google Meet, Zoom, and Teams?",
    answer:
      "Yes. The mic toggle works on any web-based calling app, including Meet, Zoom’s web client, and Teams on the web. Flip it from the toolbar instead of hunting for each app’s in-call button.",
  },
  {
    question: "Is muting my mic this way private?",
    answer:
      "Yes. The toggle blocks the tab from capturing audio. Nothing is recorded or sent anywhere by Audio Tuner — it has no servers and stores settings only in session storage.",
  },
  {
    question: "Does the site know my mic is muted?",
    answer:
      "The site sees that microphone access is no longer available for that tab. If it prompts again, flip the toggle back on. You stay in control of when each tab can hear you.",
  },
  {
    question: "Can I mute the mic on one tab and keep it on another?",
    answer:
      "Yes. The mic toggle is per tab, so your Meet tab can stay live while a second tab is silenced.",
  },
  {
    question: "Is the mic toggle free?",
    answer:
      "Yes. Audio Tuner is free with no account, in Chrome, Edge, and Brave. The mic toggle is part of the core extension.",
  },
]

function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Mic toggle questions, answered"
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
