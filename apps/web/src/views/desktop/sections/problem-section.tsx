function ProblemSection() {
  return (
    <section className="container max-w-3xl py-20 text-center sm:py-24 lg:max-w-4xl">
      <p className="font-heading text-xl font-medium text-pretty text-muted-foreground sm:text-2xl lg:text-3xl">
        Changing your microphone means opening System Settings. Muting it
        mid-call means finding the right window. And macOS sends every app to
        the same output, so a call and a video always fight over one speaker.{" "}
        <span className="text-foreground">
          Tavo puts all of it in your menu bar.
        </span>
      </p>
    </section>
  )
}

export { ProblemSection }
