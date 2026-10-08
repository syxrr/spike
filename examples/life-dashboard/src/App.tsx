import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <TooltipProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </TooltipProvider>
  )
}
