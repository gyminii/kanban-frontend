import { gql } from "@apollo/client";

import { BOARD_FIELDS, CARD_FIELDS, COLUMN_FIELDS } from "./fragments";

export const DASHBOARD_BOARDS = gql`
	query DashboardBoards($userId: String!) {
		boards(userId: $userId) {
			id
			title
			ownerId
			members
			updatedAt
			createdAt
			isFavorite
			tags
			columns {
				...ColumnFields
			}
		}
	}
	${COLUMN_FIELDS}
	${CARD_FIELDS}
`;

export const BOARD_QUERY = gql`
	query Board($boardId: ID!) {
		board(boardId: $boardId) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;

export const BOARDS_QUERY = gql`
	query Boards($userId: String!) {
		boards(userId: $userId) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;

export const CREATE_BOARD = gql`
	mutation CreateBoard(
		$title: String!
		$ownerId: String!
		$description: String
		$color: String
		$isFavorite: Boolean
		$isArchived: Boolean
		$tags: [String!]
	) {
		createBoard(
			title: $title
			ownerId: $ownerId
			description: $description
			color: $color
			isFavorite: $isFavorite
			isArchived: $isArchived
			tags: $tags
		) {
			id
			title
			ownerId
			members
			description
			color
			isFavorite
			isArchived
			tags
			createdAt
			updatedAt
			columns {
				id
			}
		}
	}
`;

export const INVITE_MEMBER = gql`
	mutation InviteMember($boardId: ID!, $memberUserId: String!) {
		inviteMember(boardId: $boardId, memberUserId: $memberUserId) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;

export const UPDATE_BOARD = gql`
	mutation UpdateBoard(
		$boardId: ID!
		$title: String
		$description: String
		$color: String
		$isFavorite: Boolean
		$isArchived: Boolean
		$tags: [String!]
	) {
		updateBoard(
			boardId: $boardId
			title: $title
			description: $description
			color: $color
			isFavorite: $isFavorite
			isArchived: $isArchived
			tags: $tags
		) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;

export const DELETE_BOARD = gql`
	mutation DeleteBoard($boardId: ID!) {
		deleteBoard(boardId: $boardId)
	}
`;
