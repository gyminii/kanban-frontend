import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function DatePicker() {
	return (
		<SidebarGroup className="px-0">
			<SidebarGroupContent>
				<Calendar
					mode="range"
					className="w-full 
						[&_[role=gridcell].bg-accent]:bg-indigo-500  
						[&_[role=gridcell].bg-accent]:text-indigo-50 
   						[&_[role=gridcell]]:w-[38px]
							rounded-xl
  				"
				/>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
