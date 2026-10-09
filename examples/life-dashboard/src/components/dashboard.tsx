import { Overview } from "@/components/overview";
import { BankingWidget } from "@/components/widgets/banking-widget";
import { CalendarWidget } from "@/components/widgets/calendar-widget";
import { ClaudeWidget } from "@/components/widgets/claude-widget";
import { EmailWidget } from "@/components/widgets/email-widget";
import { GoalsWidget } from "@/components/widgets/goals-widget";
import { MedicationWidget } from "@/components/widgets/medication-widget";
import { NotesWidget } from "@/components/widgets/notes-widget";
import { ProjectsWidget } from "@/components/widgets/projects-widget";
import { ShortcutsWidget } from "@/components/widgets/shortcuts-widget";
import { TodoWidget } from "@/components/widgets/todo-widget";

export function Dashboard() {
	return (
		<div className="flex flex-col gap-4">
			<Overview />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
				<EmailWidget className="md:col-span-2 xl:col-span-5" />
				<CalendarWidget className="xl:col-span-4" />
				<MedicationWidget className="xl:col-span-3" />

				<TodoWidget className="xl:col-span-4" />
				<NotesWidget className="xl:col-span-4" />
				<GoalsWidget className="md:col-span-2 xl:col-span-4" />

				{/* Banking is the tallest card: it spans the Projects and Claude rows. */}
				<ProjectsWidget className="md:col-span-2 xl:col-span-7" />
				<BankingWidget className="md:col-span-2 xl:col-span-5 xl:row-span-2" />
				<ClaudeWidget className="md:col-span-2 xl:col-span-7" />

				<ShortcutsWidget className="md:col-span-2 xl:col-span-12" />
			</div>
		</div>
	);
}
