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
    question: "How do I turn off a tab's webcam?",
    answer:
      "Open Audio Tuner’s popup and flip the camera toggle for that tab. The tab’s camera feed stops — no digging through the site’s camera settings.",
  },
  {
    question: "Does it work with Google Meet, Zoom, and Teams?",
    answer:
      "Yes. The webcam toggle works on any web-based calling app, including Meet, Zoom’s web client, and Teams on the web.",
  },
  {
    question: "Is turning the camera off this way private?",
    answer:
      "Yes. The toggle blocks the tab from capturing video. Audio Tuner has no servers and stores nothing — your camera feed never leaves your machine through it.",
  },
  {
    question: "Does the site know the camera is off?",
    answer:
      "The site sees that camera access is no longer available for that tab. If it prompts again, flip the toggle back on. You decide when each tab can see you.",
  },
  {
    question: "Can I keep the camera on for one tab and off for another?",
    answer:
      "Yes. The camera toggle is per tab, so your Meet camera can stay on while every other tab is blocked.",
  },
  {
    question: "Is the webcam toggle free?",
    answer:
      "Yes. Audio Tuner is free with no account, in Chrome, Edge, and Brave. The webcam toggle is part of the core extension.",
  },
]

function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Webcam toggle questions, answered"
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
