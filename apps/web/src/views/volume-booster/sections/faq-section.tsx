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
    question: "What is a volume booster?",
    answer:
      "A volume booster is a browser extension that amplifies the audio of any tab beyond the 100% maximum set by your operating system. It uses the Web Audio API to apply a real-time gain (amplifier) to the tab, so quiet audio becomes loud enough to hear on the same speakers.",
  },
  {
    question: "Is there a free volume booster for Chrome?",
    answer:
      "Yes. Audio Tuner is a completely free volume booster for Chrome, Edge, and Brave. There is no account, no trial, and no paid tier — every feature, including the 400% boost, is available to everyone.",
  },
  {
    question: "How loud can a Chrome volume booster go?",
    answer:
      "Audio Tuner can boost any tab up to 400% of its original volume — a 4× linear gain. Beyond about 250% on already-loud sources you may start to hear distortion, so boosted tabs glow amber as a reminder to dial back if needed.",
  },
  {
    question: "Does the volume booster work on YouTube, Netflix, and Spotify?",
    answer:
      "Yes. Audio Tuner works on any tab that plays audio or video, including YouTube, Netflix, Spotify web, Twitch, Udemy, and Google Meet. If a tab makes sound, it can be boosted.",
  },
  {
    question: "Will boosting volume damage my speakers or hearing?",
    answer:
      "Boosting applies a software gain and will not damage hardware speakers on its own. However, very high boost levels through small laptop speakers at full system volume can sound distorted, and any loud audio over long periods can fatigue your hearing — keep boosted levels comfortable.",
  },
  {
    question: "Is boosting audio safe and private?",
    answer:
      "Yes. Boosting is handled entirely inside the browser through the standard Web Audio API. Audio Tuner has no servers and collects no data — per-tab settings live only in session storage and are wiped when the browser closes.",
  },
]

function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Volume booster questions, answered"
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
