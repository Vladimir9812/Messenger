import { AppStore } from '@services';

export const AuthUser = (store: AppStore) => store.user;
export const AuthUserAvatar = (store: AppStore) => AuthUser(store)?.avatar;

export const Chats = (store: AppStore) => store.chats;

export const SelectedChatId = (store: AppStore) => store.selectedChat?.id;
export const SelectedChatUsers = (store: AppStore) => store.selectedChat?.users;
export const SelectedChatInfo = (store: AppStore) => {
	const selectedChatId = SelectedChatId(store);
	return Chats(store).find(chat => chat.id === selectedChatId)!;
};
