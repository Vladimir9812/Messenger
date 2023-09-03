import { expect } from 'chai';

import { Block, BaseProps } from './block';

class TestBlock extends Block {

	constructor(public tagName: string,
							public classNames: string,
							props: BaseProps) {
		super(tagName, classNames, props);
	}

	render() {
		return this.compile(null, { text: this.props.text });
	}
}

describe('Block', () => {
	const child = new TestBlock('span', 'text', { text: 'Child' });
	const block = new TestBlock('span', 'text', { text: 'Block', child });

	it('should render block with text', () => {
		const text = block.getContent()?.innerHTML;
		expect(text).to.contain('Block');
	});

	it('should render block with classname', () => {
		const className = block.getContent()?.className;
		expect(className).to.equal('text');
	});

	it('should render block with child', () => {
		const childEl = block.getContent()?.querySelector('span');
		expect(!!childEl).to.be.true;
	});
});
