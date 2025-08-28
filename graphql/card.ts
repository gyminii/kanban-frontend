import { gql } from "@apollo/client";

export const CARD_FIELDS = gql`
	fragment CardFields on Card {
		id
		columnId
		title
		description
		order
		assignedTo
		dueDate
		completed
		createdAt
		updatedAt
	}
`;

export const ADD_CARD = gql`
	mutation AddCard(
		$columnId: ID!
		$title: String!
		$description: String
		$assignedTo: String
		$dueDate: DateTime
		$completed: Boolean
	) {
		addCard(
			columnId: $columnId
			title: $title
			description: $description
			assignedTo: $assignedTo
			dueDate: $dueDate
			completed: $completed
		) {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;

export const UPDATE_CARD = gql`
	mutation UpdateCard(
		$cardId: ID!
		$title: String
		$description: String
		$assignedTo: String
		$dueDate: DateTime
		$completed: Boolean
	) {
		updateCard(
			cardId: $cardId
			title: $title
			description: $description
			assignedTo: $assignedTo
			dueDate: $dueDate
			completed: $completed
		) {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;

export const MOVE_CARD = gql`
	mutation MoveCard($cardId: ID!, $newColumnId: ID!, $newOrder: Int!) {
		moveCard(cardId: $cardId, newColumnId: $newColumnId, newOrder: $newOrder) {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;
