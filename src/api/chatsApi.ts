import {
	ChatsResponse, ChatTokenResponse, ChatUserResponse, CreateChatRequest, DeleteChatRequest,
	DeleteChatResponse,
	UsersRequest
} from '@models';

import { BaseApi } from './baseApi';

class ChatsAPIClass extends BaseApi {

	getAllChats(): Promise<ChatsResponse> {
		return this.api.get<ChatsResponse>('/chats');
	}

	createChat(chatInfo: CreateChatRequest): Promise<void> {
		return this.api.post('/chats', {}, chatInfo);
	}

	changeChatAvatar(data: FormData): Promise<ChatsResponse> {
		return this.api.put<ChatsResponse>('/chats/avatar', {}, data);
	}

	deleteChat(chatInfo: DeleteChatRequest): Promise<DeleteChatResponse> {
		return this.api.delete<DeleteChatResponse>('/chats', {}, chatInfo);
	}

	addUsersForChat(info: UsersRequest): Promise<void> {
		return this.api.put('/chats/users', {}, info);
	}

	deleteUsersFromChat(info: UsersRequest): Promise<void> {
		return this.api.delete('/chats/users', {}, info);
	}

	getChatUsers(chatId: number): Promise<ChatUserResponse[]> {
		return this.api.get<ChatUserResponse[]>(`/chats/${chatId}/users`);
	}

	getChatToken(chatId: number): Promise<ChatTokenResponse> {
		return this.api.post<ChatTokenResponse>(`/chats/token/${chatId}`);
	}
}

export const ChatsAPI = new ChatsAPIClass();
