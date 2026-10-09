import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useLifeData } from "@/lib/life-data";
import { useInstallApp } from "@/lib/install";
import { IS_PREVIEW } from "@/lib/preview";
import { InstallHelpDialog } from "@/components/install-app";
import spike from "@/assets/spike.svg";

export function NavUser() {
	const { refresh } = useLifeData();
	const { installed, install } = useInstallApp();
	const [installHelp, setInstallHelp] = useState(false);

	const resetLocal = () => {
		if (!window.confirm("Clear to-dos, medication, notes, projects, goals and shortcuts saved in this browser?")) return;
		try {
			for (const key of Object.keys(localStorage)) {
				if (key.startsWith("life-dashboard:")) localStorage.removeItem(key);
			}
		} catch {
			// Storage blocked: nothing to clear.
		}
		window.location.reload();
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="rounded-full ring-1 ring-lime/30 transition-shadow hover:ring-lime/70" type="button">
						<Avatar className="size-8 bg-ink">
							<AvatarImage className="scale-90 object-contain" src={spike} />
							<AvatarFallback>S</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="glass w-56 border-white/10 bg-[#111316]/80">
					<DropdownMenuLabel className="font-normal text-muted-foreground text-xs">Dashboard</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => refresh()}>
						<RefreshCwIcon />
						Sync all feeds
					</DropdownMenuItem>
					{!installed && !IS_PREVIEW && (
						<DropdownMenuItem onSelect={async () => (await install()) || setInstallHelp(true)}>
							<DownloadIcon />
							Install app
						</DropdownMenuItem>
					)}
					{/* The preview frame refuses confirm(), so reset would never run there. */}
					{!IS_PREVIEW && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={resetLocal} variant="destructive">
								<Trash2Icon />
								Reset saved data
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			{/* Outside the menu, so it survives the menu closing. */}
			<InstallHelpDialog onOpenChange={setInstallHelp} open={installHelp} />
		</>
	);
}
