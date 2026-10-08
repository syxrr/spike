import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { navGroups } from "@/components/app-shared";
import { SyncStatus } from "@/components/sync-status";
import spike from "@/assets/spike.svg";

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton asChild size="lg">
					<a href="#top">
						<img alt="" className="size-8 shrink-0" src={spike} />
						<span className="flex flex-col leading-tight">
							<span className="font-medium">Spike</span>
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">life dashboard</span>
						</span>
					</a>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{navGroups.map((group) => (
					<NavGroup key={group.label} {...group} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SyncStatus />
			</SidebarFooter>
		</Sidebar>
	);
}
