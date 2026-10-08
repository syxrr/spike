import { useState } from "react";
import { AlertTriangleIcon, ArrowUpRightIcon, Link2Icon, MailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { relative } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import type { MailboxId } from "@/lib/types";
import { Empty, SyncBadge, Widget } from "@/components/widgets/widget";
import { Button } from "@/components/ui/button";
import { ConnectionsDialog } from "@/components/connections-dialog";

export function EmailWidget({ className }: { className?: string }) {
	const { feeds, refresh } = useLifeData();
	const { data: mailboxes, ...sync } = feeds.email;
	const [active, setActive] = useState<MailboxId>("work");
	const box = mailboxes.find((m) => m.id === active) ?? mailboxes[0];

	return (
		<Widget
			action={
				<>
					<SyncBadge {...sync} onRefresh={() => refresh("email")} />
					<ConnectionsDialog
						trigger={
							<Button aria-label="Manage Google accounts" className="size-7" size="icon" variant="ghost">
								<Link2Icon className="size-4" />
							</Button>
						}
					/>
				</>
			}
			className={className}
			icon={MailIcon}
			id="email"
			title="Email"
		>
			<div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/5" role="tablist">
				{mailboxes.map((m) => (
					<button
						aria-selected={m.id === box?.id}
						className={cn(
							"flex items-center justify-center gap-1.5 truncate rounded-lg px-2 py-1.5 text-xs transition-colors",
							m.id === box?.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
						)}
						key={m.id}
						onClick={() => setActive(m.id)}
						role="tab"
						title={m.label}
						type="button"
					>
						{/* "Work / admin" shortens to "Work" on phones. */}
						<span className="truncate sm:hidden">{m.label.split(" / ")[0]}</span>
						<span className="hidden truncate sm:inline">{m.label}</span>
						{m.unreadCount > 0 && (
							<span className="rounded-full bg-lime px-1.5 font-mono text-[10px] text-ink leading-4">{m.unreadCount}</span>
						)}
					</button>
				))}
			</div>

			{box?.error && (
				<p className="mb-2 flex items-center gap-2 rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-amber-100 text-xs ring-1 ring-amber-400/20">
					<AlertTriangleIcon className="size-3.5 shrink-0 text-amber-300" />
					{box.error}
				</p>
			)}

			{box?.connected === false ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 border-dashed px-4 py-6 text-center">
					<span className="text-muted-foreground text-sm">No account linked to {box.label.toLowerCase()} yet.</span>
					<ConnectionsDialog
						trigger={
							<Button size="sm">
								<Link2Icon /> Connect Gmail
							</Button>
						}
					/>
				</div>
			) : box && box.messages.length > 0 ? (
				<ul className="-mx-2 flex flex-col">
					{box.messages.slice(0, 4).map((msg) => (
						<li key={msg.id}>
							<a
								className="group flex gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
								href={msg.url ?? box.webUrl}
								rel="noreferrer"
								target="_blank"
							>
								<span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", msg.unread ? "bg-lime" : "bg-transparent")} />
								<span className="min-w-0 flex-1">
									<span className="flex items-baseline justify-between gap-2">
										<span className={cn("truncate text-sm", msg.unread ? "font-medium" : "text-muted-foreground")}>{msg.from}</span>
										<span className="shrink-0 font-mono text-[10px] text-muted-foreground">{relative(msg.receivedAt)}</span>
									</span>
									<span className="block truncate text-[13px] text-foreground/85">{msg.subject}</span>
									<span className="block truncate text-muted-foreground text-xs">{msg.snippet}</span>
								</span>
							</a>
						</li>
					))}
				</ul>
			) : (
				!box?.error && <Empty>Inbox zero.</Empty>
			)}

			{box?.webUrl && (
				<Button asChild className="mt-auto self-start px-0 text-muted-foreground text-xs hover:text-lime" size="sm" variant="link">
					<a href={box.webUrl} rel="noreferrer" target="_blank">
						Open {box.address} <ArrowUpRightIcon className="size-3" />
					</a>
				</Button>
			)}
		</Widget>
	);
}
