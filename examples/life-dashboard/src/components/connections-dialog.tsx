import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangleIcon, Link2Icon, Loader2Icon, Unlink2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeData } from "@/lib/life-data";
import type { Connection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type Status =
	| { kind: "loading" }
	| { kind: "offline" }
	| { kind: "ready"; configured: boolean; connections: Connection[] };

/** Lists the Google account slots and links or unlinks them. */
export function ConnectionsDialog({ trigger }: { trigger: ReactNode }) {
	const { refresh } = useLifeData();
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<Status>({ kind: "loading" });
	const [busy, setBusy] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			const res = await fetch("/api/connections", { headers: { accept: "application/json" } });
			if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) throw new Error();
			setStatus({ kind: "ready", ...(await res.json()) });
		} catch {
			setStatus({ kind: "offline" });
		}
	}, []);

	useEffect(() => {
		if (open) load();
	}, [open, load]);

	const disconnect = async (slot: string) => {
		setBusy(slot);
		try {
			await fetch(`/api/connections/${slot}/disconnect`, { method: "POST", headers: { "x-life-dashboard": "1" } });
		} finally {
			setBusy(null);
			await load();
			refresh("email");
			refresh("calendar");
		}
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="glass border-white/10 bg-[#111316]/80">
				<DialogHeader>
					<DialogTitle>Google accounts</DialogTitle>
					<DialogDescription>
						Link one Google account per inbox. Calendar shows the primary calendar of every linked account. Access is
						read-only.
					</DialogDescription>
				</DialogHeader>

				{status.kind === "loading" && (
					<div className="grid place-items-center py-6 text-muted-foreground">
						<Loader2Icon className="size-5 animate-spin" />
					</div>
				)}

				{status.kind === "offline" && (
					<Notice>
						The dashboard server isn't running. Start everything with <code className="text-lime">npm run dev</code>, or{" "}
						<code className="text-lime">npm start</code> after a build.
					</Notice>
				)}

				{status.kind === "ready" && !status.configured && (
					<Notice>
						Google isn't set up yet. Add <code className="text-lime">GOOGLE_CLIENT_ID</code> and{" "}
						<code className="text-lime">GOOGLE_CLIENT_SECRET</code> to <code className="text-lime">.env</code> and restart
						the server. The README walks through creating them.
					</Notice>
				)}

				{status.kind === "ready" && (
					<ul className="flex flex-col gap-1.5">
						{status.connections.map((c) => (
							<li className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]" key={c.slot}>
								<span
									className={cn(
										"size-2 shrink-0 rounded-full",
										!c.email ? "bg-white/20" : c.needsReconnect ? "bg-amber-400" : "bg-lime shadow-[0_0_8px_var(--lime)]"
									)}
								/>
								<span className="min-w-0 flex-1">
									<span className="block text-sm">{c.label}</span>
									<span className="block truncate font-mono text-[11px] text-muted-foreground">
										{c.email ?? "Not connected"}
										{c.needsReconnect && " · access expired"}
									</span>
								</span>
								{c.email && !c.needsReconnect ? (
									<Button disabled={busy === c.slot} onClick={() => disconnect(c.slot)} size="sm" variant="ghost">
										{busy === c.slot ? <Loader2Icon className="animate-spin" /> : <Unlink2Icon />}
										Disconnect
									</Button>
								) : (
									<Button asChild disabled={!status.configured} size="sm">
										<a
											aria-disabled={!status.configured}
											className={cn(!status.configured && "pointer-events-none opacity-50")}
											href={`/auth/google/start?slot=${c.slot}${c.email ? `&hint=${encodeURIComponent(c.email)}` : ""}`}
										>
											<Link2Icon />
											{c.needsReconnect ? "Reconnect" : "Connect"}
										</a>
									</Button>
								)}
							</li>
						))}
					</ul>
				)}
			</DialogContent>
		</Dialog>
	);
}

function Notice({ children }: { children: ReactNode }) {
	return (
		<p className="flex gap-2.5 rounded-xl bg-amber-400/10 px-3 py-2.5 text-amber-100 text-sm ring-1 ring-amber-400/20">
			<AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-300" />
			<span>{children}</span>
		</p>
	);
}
