import { gql } from "@apollo/client";

export const CARD_FIELDS = gql`
	fragment CardFields on Card {
		__typename
		id
		columnId
		title
		description
		order
		assignedTo
		dueDate
		completed
		tags
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
		$tags: [String!]
	) {
		addCard(
			columnId: $columnId
			title: $title
			description: $description
			assignedTo: $assignedTo
			dueDate: $dueDate
			completed: $completed
			tags: $tags
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
		$tags: [String!]
	) {
		updateCard(
			cardId: $cardId
			title: $title
			description: $description
			assignedTo: $assignedTo
			dueDate: $dueDate
			completed: $completed
			tags: $tags
		) {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;

export const DELETE_CARD = gql`
	mutation DeleteCard($cardId: ID!) {
		deleteCard(cardId: $cardId)
	}
`;

export const MOVE_CARD = gql`
	mutation MoveCard($cardId: ID!, $newColumnId: ID!, $newOrder: Int!) {
		moveCard(cardId: $cardId, newColumnId: $newColumnId, newOrder: $newOrder) {
			...CardFields
		}
	}
	${CARD_FIELDS}
`;
