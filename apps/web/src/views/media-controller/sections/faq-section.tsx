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
    question: "What is a browser media controller?",
    answer:
      "It's an extension that puts per-tab controls for volume, microphone, and webcam in one place — your toolbar. Instead of hunting through each site's settings, you adjust every tab from the same popup.",
  },
  {
    question: "Is there a free media controller for Chrome?",
    answer:
      "Yes. Audio Tuner is a free media controller for Chrome, Edge, and Brave. No account, no trial, no paid tier — volume, mic, and camera controls are all included.",
  },
  {
    question: "What can I control on each tab?",
    answer:
      "Three things: volume (mute or boost up to 400%), the microphone, and the webcam. Each one is a per-tab switch, so what you change on one tab doesn't affect the others.",
  },
  {
    question: "Does it work with Google Meet, Zoom, and Teams?",
    answer:
      "Yes. Volume, mic, and camera controls all work on call tabs. Some protected streams may limit volume boost, but the mic and webcam toggles apply cleanly.",
  },
  {
    question: "Is a media controller private?",
    answer:
      "Audio Tuner is. It has no servers and stores settings only in session storage, wiped when the browser closes. Mic and camera toggles block the tab from your hardware locally — nothing is recorded or sent.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Chrome, Edge, Brave, and other Chromium browsers. A Firefox build is also available. Audio Tuner is free.",
  },
]

function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Media controller questions, answered"
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
