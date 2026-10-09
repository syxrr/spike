import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			{/* Safe-area insets keep content clear of the notch and home bar when installed. */}
			<SidebarInset
				className="bg-transparent pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6"
				id="top"
			>
				<AppHeader />
				<div className="flex flex-1 flex-col gap-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
