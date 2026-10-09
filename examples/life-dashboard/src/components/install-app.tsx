import { PlusSquareIcon, ShareIcon } from "lucide-react";
import { isIos } from "@/lib/install";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Manual install steps, for browsers with no install prompt. */
export function InstallHelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="glass border-white/10 bg-[#111316]/80">
				<DialogHeader>
					<DialogTitle>Install Spike</DialogTitle>
					<DialogDescription>Adds the dashboard to your home screen as a full-screen app that also opens offline.</DialogDescription>
				</DialogHeader>
				{isIos() ? (
					<ol className="flex flex-col gap-2 text-sm">
						<li className="flex items-center gap-2">
							<span className="font-mono text-lime">1</span> In Safari, tap <ShareIcon className="size-4 text-lime" /> Share.
						</li>
						<li className="flex items-center gap-2">
							<span className="font-mono text-lime">2</span> Choose <PlusSquareIcon className="size-4 text-lime" /> Add to Home Screen.
						</li>
						<li className="flex items-center gap-2">
							<span className="font-mono text-lime">3</span> Tap Add. Spike appears with your other apps.
						</li>
					</ol>
				) : (
					<p className="text-muted-foreground text-sm">
						Use your browser's menu: <span className="text-foreground">Install Spike</span> in Chrome or Edge (also an
						install icon in the address bar), or <span className="text-foreground">Add to Dock</span> in Safari on a Mac.
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
