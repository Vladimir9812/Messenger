import { Block, ChildrenProps } from '@services';
import { Fieldset } from '@components';
import { isEqual } from '@utilities';

import { ValidatorFn } from './validator';

export type FieldType = 'text' | 'password';

export interface FormField<T = string> {
  name: string;
  label: string;
  type?: FieldType;
  value: T;
	disabled?: boolean;
  validators?: ValidatorFn[];
	mode?: 'horizontal';
}

export type FormData<T extends Record<string, string> = Record<string, string>> = {
	[Key in keyof T]: string
}

interface BaseFormProps {
	fields: Fieldset[];

	onSendData(formData: FormData): void;
}

export abstract class FormBlock<T extends BaseFormProps, U extends FormData> extends Block<T> {

	initialFormData: Record<string, string> = {};

	get fields(): Fieldset[] {
		return this.props.fields;
	}

	get formData(): U {
		const formData: Record<string, string> = {};

		this.fields.forEach((field: Fieldset) => {
			formData[field.props.name] = field.getValue();
		});

		return formData as U;
	}

	protected constructor(public readonly tagName: string,
												public readonly classNames: string,
												propsAndChildren: T | ChildrenProps
	) {
		super(tagName, classNames, propsAndChildren);

		this.fields.forEach(field => this.initialFormData[field.props.name] = field.getValue());
	}

	validateForm(): boolean {
		let isValid = true;

		this.fields.forEach((field: Fieldset) => {
			isValid = field.forceValidations() && isValid;
		});

		return isValid;
	}

	patchValue(value: U) {
		this.fields.forEach(field => {
			field.setValue(value[field.props.name]);
			this.initialFormData[field.props.name] = field.getValue();
		});
	}

	onSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!this.validateForm() || isEqual(this.formData, this.initialFormData)) {
			return;
		}

		this.fields.forEach(field => {
			this.initialFormData[field.props.name] = field.getValue();
		});

		this.props.onSendData(this.formData);
	}
}
