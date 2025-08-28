// graphql/column.ts
import { gql } from "@apollo/client";
import { CARD_FIELDS } from "./card";

export const COLUMN_FIELDS = gql`
	fragment ColumnFields on Column {
		__typename
		id
		boardId
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

export const ADD_COLUMN = gql`
	mutation AddColumn(
		$boardId: ID!
		$title: String!
		$description: String
		$startDate: DateTime
		$endDate: DateTime
		$status: String
	) {
		addColumn(
			boardId: $boardId
			title: $title
			description: $description
			startDate: $startDate
			endDate: $endDate
			status: $status
		) {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
`;

export const MOVE_COLUMN = gql`
	mutation MoveColumn($columnId: ID!, $newOrder: Int!) {
		moveColumn(columnId: $columnId, newOrder: $newOrder) {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
`;
