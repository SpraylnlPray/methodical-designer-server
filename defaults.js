const defaultSeq = {
	group: 'None',
	seq: -1,
	label: 'None',
};
const defaultLink = {
	id: '-1',
	label: 'None',
	from_id: '-1',
	to_id: '-1',
	type: 'None',
	story: 'None',
	sequence: defaultSeq,
	optional: false,
};
const defaultNode = {
	id: '-1',
	label: 'None',
	story: 'None',
	type: 'None',
	synchronous: false,
	unreliable: false,
};
const defaultLinkEnd = { note: 'None', arrow: 'default' };
const defaultRes = { success: true, message: '' };
const errorRes = e => ({ success: false, message: e.message });

module.exports = { defaultSeq, defaultLink, defaultNode, defaultLinkEnd, defaultRes, errorRes };