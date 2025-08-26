import { gql } from "@apollo/client";
import { COLUMN_FIELDS } from "./column";

export const BOARD_FIELDS = gql`
	fragment BoardFields on Board {
		id
		title
		ownerId
		members
		createdAt
		updatedAt
		columns {
			...ColumnFields
		}
	}
	${COLUMN_FIELDS}
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
	mutation CreateBoard($title: String!, $ownerId: String!) {
		createBoard(title: $title, ownerId: $ownerId) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;

export const INVITE_MEMBER = gql`
	mutation InviteMember($boardId: ID!, $memberUserId: String!) {
		inviteMember(boardId: $boardId, memberUserId: $memberUserId) {
			...BoardFields
		}
	}
	${BOARD_FIELDS}
`;
