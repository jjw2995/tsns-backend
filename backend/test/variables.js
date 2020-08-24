let user_1 = {
	nickname: 'user1',
	email: 'user_1@qwerty.com',
	password: 'dD1@dasdf',
};
let user_2 = {
	nickname: 'user2',
	email: 'user_2@qwerty.com',
	password: 'dD1@dasdf',
};
let privateUser_1 = {
	nickname: 'privateUser1',
	email: 'privateUser_1@qwerty.com',
	password: 'dD1@dasdf',
	// isPrivate: true,
};
let privateUser_2 = {
	nickname: 'privateUser2',
	email: 'privateUser_2@qwerty.com',
	password: 'dD1@dasdf',
	// isPrivate: true,
};

let postFollowers = {
	description: 'followers',
	media: ['asf'],
	level: 'followers',
};

let postPrivate = { description: 'private', media: ['fasf'], level: 'private' };

let postPublic = { description: 'public', media: ['qwrs'], level: 'public' };

module.exports = {
	user_1,
	user_2,
	privateUser_1,
	privateUser_2,
	postFollowers,
	postPrivate,
	postPublic,
};
