import { AuthUser, classNames } from '@utilities';
import { Block, Store } from '@services';
import { ChatMessageResponse } from '@models';

import { Time } from '../time/time';

import MessageTemplate from './message.hbs';
import './message.css';

interface Props {
  message: ChatMessageResponse;
}

interface SuperProps extends Props {
  time: Time;
}

export class Message extends Block<SuperProps> {

  constructor(props: Props) {
    const superProps: SuperProps = {
      ...props,
      time: new Time({ date: props.message.time })
    };

    super('div', 'message', superProps);
  }

  render(): DocumentFragment {
    const { message } = this.props;
		const currentUserId = Store.getState(AuthUser)!.id;

    const className = classNames('message__content', {
      'message__content_left': message.user_id !== currentUserId,
      'message__content_right': message.user_id === currentUserId
    });

    return this.compile(MessageTemplate, { className, content: message.content });
  }
}
