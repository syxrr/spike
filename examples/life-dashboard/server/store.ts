// Linked Google accounts, persisted to a JSON file readable only by its owner.
// The file holds refresh tokens, so it lives outside the web root and git.

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MailboxId } from "../src/lib/types.ts";

export type StoredAccount = {
	email: string;
	refreshToken: string;
	/** Set when Google rejects the refresh token; cleared by reconnecting. */
	needsReconnect?: boolean;
};

type StoreFile = Partial<Record<MailboxId, StoredAccount>>;

const FILE = path.resolve(process.env.TOKEN_FILE ?? path.join(import.meta.dirname, ".data", "accounts.json"));

let cache: StoreFile | null = null;

async function load(): Promise<StoreFile> {
	if (cache) return cache;
	try {
		cache = JSON.parse(await readFile(FILE, "utf8")) as StoreFile;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
		cache = {};
	}
	return cache;
}

async function save(data: StoreFile) {
	await mkdir(path.dirname(FILE), { recursive: true, mode: 0o700 });
	// Write then rename so a crash never leaves a half-written token file.
	const tmp = `${FILE}.tmp`;
	await writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
	await chmod(tmp, 0o600);
	await rename(tmp, FILE);
	cache = data;
}

export async function getAccount(slot: MailboxId) {
	return (await load())[slot];
}

export async function allAccounts() {
	return Object.entries(await load()) as [MailboxId, StoredAccount][];
}

export async function setAccount(slot: MailboxId, account: StoredAccount) {
	await save({ ...(await load()), [slot]: account });
}

export async function markNeedsReconnect(slot: MailboxId) {
	const data = await load();
	const account = data[slot];
	if (account && !account.needsReconnect) await save({ ...data, [slot]: { ...account, needsReconnect: true } });
}

export async function removeAccount(slot: MailboxId) {
	const data = { ...(await load()) };
	delete data[slot];
	await save(data);
}
