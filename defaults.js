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
	// todo: this is not ideal as it is information only relevant to the editor
	edited: false,
	created: false,
};
const defaultNode = {
	id: '-1',
	label: 'None',
	story: 'None',
	type: 'None',
	synchronous: false,
	unreliable: false,
	// todo: this is not ideal as it is information only relevant to the editor
	edited: false,
	created: false,
};
const defaultLinkEnd = { note: 'None', arrow: 'default' };

module.exports = { defaultSeq, defaultLink, defaultNode, defaultLinkEnd };