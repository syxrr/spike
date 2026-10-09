import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { IS_PREVIEW } from "@/lib/preview";

const activeItem = navLinks.find((item) => item.isActive);

export function AppHeader() {
	return (
		<header
			className={cn(
				"mb-4 flex items-center justify-between gap-2 md:px-2"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-3">
				{IS_PREVIEW && (
					<span className="rounded-full bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] text-amber-300 uppercase tracking-wider ring-1 ring-amber-400/25">
						Preview · demo data
					</span>
				)}
				<NavUser />
			</div>
		</header>
	);
}
