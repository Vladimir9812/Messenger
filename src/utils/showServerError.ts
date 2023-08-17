import { Notifier } from '@services';

export function showServerError(resp: { reason: string }) {
	resp.reason !== 'Cookie is not valid' && Notifier.error(resp.reason);
}
