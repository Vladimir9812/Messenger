type PlainObject<T = unknown> = {
	[k in string]: T;
};

export function merge(lhs: PlainObject, rhs: PlainObject): PlainObject {
	for (const p in rhs) {
		// eslint-disable-next-line no-prototype-builtins
		if (!rhs.hasOwnProperty(p)) {
			continue;
		}

		try {
			if ((rhs[p] as PlainObject).constructor === Object) {
				rhs[p] = merge(lhs[p] as PlainObject, rhs[p] as PlainObject);
			} else {
				lhs[p] = rhs[p];
			}
		} catch(e) {
			lhs[p] = rhs[p];
		}
	}

	return lhs;
}
