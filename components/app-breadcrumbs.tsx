"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/utils/breadcrumbs/breadcrumbs-provider";

export function AppBreadcrumbs() {
	const { board, column, card } = useBreadcrumbs();

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
				</BreadcrumbItem>

				{board && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href={`/board/${board.id}`}>
								{board.title}
							</BreadcrumbLink>
						</BreadcrumbItem>
					</>
				)}

				{column && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href={`/board/${board?.id}?column=${column.id}`}>
								{column.title}
							</BreadcrumbLink>
						</BreadcrumbItem>
					</>
				)}

				{card && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{card.title}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
