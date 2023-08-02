import {
	ChatTokenResponse, ChatUserResponse,
	DeleteChatRequest, UserResponse, UsersRequest
} from '@models';
import { ChatsAPI } from '@api';
import { Notifier, Store, Router } from '@services';
import { Chats, SelectedChatUsers, showServerError } from '@utilities';
import { CHATS_PATH } from '@constants';

class ChatsControllerClass {

	getAllChats(): Promise<void> {
		return ChatsAPI.getAllChats()
			.then(chats => Store.updateState('chats', chats))
			.catch(showServerError);
	}

	createChat(chatTitle: string, chatUsers: UserResponse[]): Promise<void> {
		return ChatsAPI.createChat({ title: chatTitle })
			.then(this.getAllChats)
			.then(() => {
				const createdChat = Store.getState(Chats).find(({ title }) => title === chatTitle)!;
				chatUsers.length > 0 && this.addUsersForChat(chatUsers, createdChat.id);
				return createdChat.id;
			})
			.then(chatId => Router.go(`${CHATS_PATH}?viewId=${chatId}`))
			.then(() => Notifier.success('Чат успешно создан'))
			.catch(showServerError);
	}

	changeChatAvatar(data: FormData): Promise<void> {
		return ChatsAPI.changeChatAvatar(data)
			.then(chat => {
				const chats = Store.getState(Chats);
				const newChats = chats.map(ch => ({
					...ch,
					avatar: ch.id === chat.id ? chat.avatar : ch.avatar
				}));

				Store.updateState('chats', newChats);
			})
			.then(() => Notifier.success('Аватар успешно обновлен'))
			.catch(showServerError);
	}

	deleteChat(chatInfo: DeleteChatRequest): Promise<void> {
		return ChatsAPI.deleteChat(chatInfo)
			.then(({ result: chat }) => {
				const chats = Store.getState(Chats);
				const newChats = chats.filter(ch => ch.id !== chat.id);

				Store.updateState('chats', newChats);
			})
			.then(() => Notifier.success('Чат успешно удален'))
			.then(() => Router.go(CHATS_PATH))
			.catch(err => {
				showServerError(err);
				Notifier.warn('Удалить чат может только администратор');
			});
	}

	addUsersForChat(users: UserResponse[], chatId: number): Promise<void> {
		const request: UsersRequest = {
			users: users.map(user => user.id),
			chatId
		};

		return ChatsAPI.addUsersForChat(request)
			.then(() => Notifier.success('Пользователи успешно добавлены'))
			.then(() => {
				const chatUsers = Store.getState(SelectedChatUsers)!;
				Store.updateState(
					'selectedChat.users',
					[...chatUsers, ...users.map(user => ({ ...user, role: 'regular' }))]
				);
			})
			.catch(showServerError);
	}

	deleteUsersFromChat(users: ChatUserResponse[], chatId: number): Promise<void> {
		const appendedUserIds = users.map(user => user.id);

		const request: UsersRequest = {
			users: appendedUserIds,
			chatId
		};

		return ChatsAPI.deleteUsersFromChat(request)
			.then(() => Notifier.success('Пользователи успешно удалены'))
			.then(() => {
				const chatUsers = Store.getState(SelectedChatUsers)!;
				Store.updateState(
					'selectedChat.users', chatUsers.filter(({ id }) => !appendedUserIds.includes(id))
				);
			})
			.catch(showServerError);
	}

	getChatUsers(chatId: number): Promise<void> {
		return ChatsAPI.getChatUsers(chatId)
			.then(users => Store.updateState('selectedChat.users', users))
			.catch(showServerError);
	}

	getChatToken(chatId: number): Promise<ChatTokenResponse> {
		return ChatsAPI.getChatToken(chatId)
			.catch(err => {
				showServerError(err);
				return { token: '' };
			});
	}
}

export const ChatsController = new ChatsControllerClass();
