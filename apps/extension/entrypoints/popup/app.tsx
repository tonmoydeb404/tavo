import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { MixerView } from "./views"

function App() {
  return (
    <TooltipProvider delay={400}>
      <div className="flex w-full flex-col p-4 font-sans">
        <MixerView />
      </div>
    </TooltipProvider>
  )
}

export { App }
