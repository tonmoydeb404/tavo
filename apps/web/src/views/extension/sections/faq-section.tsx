import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

import { SectionHeading } from "../components"

export type Faq = {
  question: string
  answer: string
}

export const faqs: Faq[] = [
  {
    question: "What can I actually control on each tab?",
    answer:
      "Volume, mic, and camera — per tab. Mute a single tab without silencing every tab on that site, boost the quiet one up to 400%, and flip your mic or webcam off without digging through site settings.",
  },
  {
    question: "Doesn't Chrome already let me mute a tab?",
    answer:
      "Chrome's built-in mute silences every tab on the same site at once. Audio Tuner mutes one tab at a time, so you can hush a single noisy YouTube tab without killing the music in the one next to it.",
  },
  {
    question: "What does boosting past 100% actually do?",
    answer:
      "It makes a tab louder than your system's max, using the Web Audio API. Quiet dialogue becomes audible on laptop speakers. Push it too far and it'll distort — boosted tabs glow amber so you can dial it back.",
  },
  {
    question: "How do the mic and webcam toggles work?",
    answer:
      "Each toggle turns off that tab's access to your mic or camera, right from the popup. No hunting for the site's button, no digging through browser settings — flip it off, done. Other tabs aren't affected.",
  },
  {
    question: "Does it work with Google Meet, Zoom, and Teams?",
    answer:
      "Yes. Mute, boost, mic, and camera toggles all work on call tabs. Some protected streams limit volume boost, but the mic and webcam toggles apply cleanly.",
  },
  {
    question: "Is my data collected?",
    answer:
      "No. Per-tab settings live in session storage and get wiped when the browser closes. No servers, no accounts, no tracking.",
  },
  {
    question: "Which browsers are supported, and is it free?",
    answer:
      "Chrome, Edge, Brave, and other Chromium browsers. A Firefox build is also available. Audio Tuner is free.",
  },
]

function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
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
