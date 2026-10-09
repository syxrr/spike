import { useState, type ReactNode } from "react";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** One-line "type and press Enter" form. */
export function QuickAdd({
	placeholder,
	onAdd,
	children,
}: {
	placeholder: string;
	onAdd: (text: string) => void;
	/** Extra fields rendered before the add button. */
	children?: ReactNode;
}) {
	const [text, setText] = useState("");
	return (
		<form
			className="flex gap-1.5"
			onSubmit={(e) => {
				e.preventDefault();
				const value = text.trim();
				if (!value) return;
				onAdd(value);
				setText("");
			}}
		>
			<Input
				aria-label={placeholder}
				className="h-8 border-white/10 bg-white/[0.03] text-sm"
				onChange={(e) => setText(e.target.value)}
				placeholder={placeholder}
				value={text}
			/>
			{children}
			<Button aria-label="Add" className="size-8 shrink-0" size="icon" type="submit">
				<PlusIcon />
			</Button>
		</form>
	);
}
