import { FormField, FormData, FormBlock } from '@models';

import { Fieldset } from '../fieldset/fieldset';
import { Button } from '../button/button';
import { Link } from '../link/link';

import FormTemplate from './form.hbs';
import './form.css';

interface Props<T> {
	title: string;
  fields: FormField[];
  buttonText: string;
	link?: Link;

  onSendData(formData: T): void;
}

interface SuperProps<T> extends Omit<Props<T>, 'fields'> {
	fields: Fieldset[];
  button: Button;

	onSubmit(e: SubmitEvent): void;
}

export class Form<T extends FormData<T> = Record<string, any>> extends FormBlock<SuperProps<T>, T> {

  constructor(props: Props<T>) {
    const superProps: SuperProps<T> = {
      ...props,
			fields: props.fields.map(field => new Fieldset(field)),
      button: new Button({
				attr: { type: 'submit' },
        text: props.buttonText
			}),
			onSubmit: e => this.onSubmit(e)
		};

    super('form', 'form', superProps);
  }

  render(): DocumentFragment {
    return this.compile(FormTemplate, {
			title: this.props.title,
      linkHref: this.props.linkHref,
      linkText: this.props.linkText
    });
  }
}
