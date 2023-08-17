import { ChatsResponse, ChatUserResponse, UserResponse } from '../models/api';
import { set } from '../utils/set';

import { EventBus } from './eventBus';

export enum StoreEvents {
	STORE_CHANGED = 'store-changed'
}

interface SelectedChat {
	id: number;
	users: ChatUserResponse[];
}

export interface AppStore {
	user: UserResponse | null;
	chats: ChatsResponse[];
	selectedChat: SelectedChat | null;
}

const initialStore: AppStore = {
	user: null,
	chats: [],
	selectedChat: null
};

class StoreClass extends EventBus {

	private _state: AppStore = initialStore;

	constructor() {
		super();

		this.on(StoreEvents.STORE_CHANGED, () => null);
	}

	getState<T = unknown>(fn: (store: AppStore) => T) {
		return fn(this._state);
	}

	updateState(path: string, value: unknown) {
		set(this._state, path, value);
		this.emit(StoreEvents.STORE_CHANGED);
	}
}

export const Store = new StoreClass();
