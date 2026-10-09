import type { ReactNode } from "react";
import {
	CalendarDaysIcon,
	FolderKanbanIcon,
	LandmarkIcon,
	LayoutGridIcon,
	LinkIcon,
	ListTodoIcon,
	MailIcon,
	NotebookPenIcon,
	PillIcon,
	SparklesIcon,
	TargetIcon,
} from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

// Paths are in-page anchors: each points at a widget's id.
export const navGroups: SidebarNavGroup[] = [
	{
		label: "Today",
		items: [
			{ title: "Overview", path: "#top", icon: <LayoutGridIcon />, isActive: true },
			{ title: "Email", path: "#email", icon: <MailIcon /> },
			{ title: "Calendar", path: "#calendar", icon: <CalendarDaysIcon /> },
		],
	},
	{
		label: "Life admin",
		items: [
			{ title: "To-do", path: "#todo", icon: <ListTodoIcon /> },
			{ title: "Medication", path: "#medication", icon: <PillIcon /> },
			{ title: "Notes", path: "#notes", icon: <NotebookPenIcon /> },
		],
	},
	{
		label: "Building",
		items: [
			{ title: "Projects", path: "#projects", icon: <FolderKanbanIcon /> },
			{ title: "Goals", path: "#goals", icon: <TargetIcon /> },
		],
	},
	{
		label: "Money & tools",
		items: [
			{ title: "Banking", path: "#banking", icon: <LandmarkIcon /> },
			{ title: "Claude usage", path: "#claude", icon: <SparklesIcon /> },
			{ title: "Shortcuts", path: "#shortcuts", icon: <LinkIcon /> },
		],
	},
];

export const navLinks: SidebarNavItem[] = navGroups.flatMap((group) => group.items);
