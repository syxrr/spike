import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard'
import { DitherBackdrop } from '@/components/dither-backdrop'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LifeDataProvider } from '@/lib/life-data'

export default function App() {
  return (
    <LifeDataProvider>
      <TooltipProvider>
        <DitherBackdrop />
        <AppShell>
          <Dashboard />
        </AppShell>
      </TooltipProvider>
    </LifeDataProvider>
  )
}
