import { classNames, Chats, getQueryParam } from '@utilities';
import { ConnectBlock, Store, Router } from '@services';
import { ChatsResponse } from '@models';
import { CHATS_PATH } from '@constants';

import { Chat, Messages, NoMessages, Panel } from './components';
import ChatsTemplate from './chats.hbs';
import './chats.css';

interface SuperProps {
  panel: Panel;
  messages: Messages | NoMessages;
  messagesClassName: string;
}

function getChatList() {
	const chats = Store.getState(Chats);

	const selectedChatId = +(getQueryParam('viewId') as string) || null;
	const selectedChat: ChatsResponse | undefined = chats.find(chat => chat.id === selectedChatId);

	selectedChatId && Store.updateState('selectedChat.id', selectedChatId);

	const chatList: Chat[] = chats.map(chat => new Chat({
		chat: {
			...chat,
			selected: selectedChatId === chat.id
		}
	}));

	return { chats, chatList, selectedChat };
}

export class ChatsPage extends ConnectBlock<SuperProps> {

  constructor() {
		const { chatList, selectedChat } = getChatList();

		const superProps: SuperProps = {
			panel: new Panel({ chatList }),
			messages: selectedChat ? new Messages({ chat: selectedChat }) : new NoMessages(),
			messagesClassName: classNames(
				'chats-messages', { 'chats-messages_hidden': !selectedChat }
			)
		};

    super('div', 'chats', superProps, Chats);
  }

	onStoreUpdated() {
		const { chats, chatList, selectedChat } = getChatList();
		this.props.panel.setProps({ chatList });

		if (!chats.find(({ id }) => id === selectedChat?.id)) {
			Router.go(CHATS_PATH);
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		Store.updateState('selectedChat', null);
	}

	render(): DocumentFragment {
    return this.compile(ChatsTemplate, { messagesClassName: this.props.messagesClassName });
  }
}
