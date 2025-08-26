import { gql } from "@apollo/client";
import { CARD_FIELDS } from "./card";

export const COLUMN_FIELDS = gql`
	fragment ColumnFields on Column {
		id
		boardId
		title
		order
		cards {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;

export const ADD_COLUMN = gql`
	mutation AddColumn($boardId: ID!, $title: String!) {
		addColumn(boardId: $boardId, title: $title) {
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
