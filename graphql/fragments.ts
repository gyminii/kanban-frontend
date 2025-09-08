// fragments.ts
import { gql } from "@apollo/client";

export const CARD_FIELDS = gql`
	fragment CardFields on Card {
		id
		title
		description
		order
		assignedTo
		dueDate
		completed
		columnId
		tags
	}
`;

export const COLUMN_FIELDS = gql`
	fragment ColumnFields on Column {
		id
		title
		order
		description
		startDate
		endDate
		status
		createdAt
		updatedAt
		cards {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;

export const BOARD_FIELDS = gql`
	fragment BoardFields on Board {
		id
		title
		ownerId
		members
		createdAt
		updatedAt
		isFavorite
		tags
		description
		isArchived
		color
		columns {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
`;

export const DASHBOARD_BOARD_FIELDS = gql`
	fragment DashboardBoardFields on Board {
		id
		title
		ownerId
		members
		updatedAt
		columns {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
`;
