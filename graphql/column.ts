import { gql } from "@apollo/client";
import { COLUMN_FIELDS } from "./fragments";

export const COLUMN_QUERY = gql`
	query Column($columnId: ID!) {
		column(columnId: $columnId) {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
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

export const UPDATE_COLUMN = gql`
	mutation UpdateColumn(
		$columnId: ID!
		$title: String
		$description: String
		$startDate: DateTime
		$endDate: DateTime
		$status: String
	) {
		updateColumn(
			columnId: $columnId
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

export const DELETE_COLUMN = gql`
	mutation DeleteColumn($columnId: ID!) {
		deleteColumn(columnId: $columnId)
	}
`;
