const chai = require('chai');
const mongoose = require('mongoose');
const { expect } = require('chai');

// var should = chai.should()

const Post = mongoose.model('Post');
const { PostService } = require('../services');

let Service = new PostService(Post);

let log = (m) => console.log('\n', m, '\n');

before('asd', async () => {
	let dbp = 'mongodb://localhost:27017';
	await mongoose.connect(dbp, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	});
	// let a = await Post.collection.getIndexes({ full: true })
	// log(a)
	// await Post.collection.dropIndexes()
	await dbReset();
});

// after(async () => {
//     await dbReset()
//     await mongoose.disconnect()
// })

async function dbReset() {
	await Post.deleteMany({});
}

beforeEach(async () => {
	await dbReset();
});

function addPostMiscelFields(post, level = 'friends', likes = 0) {
	if (!post.level) {
		post.level = level;
	}
	if (!post.likes) {
		post.likes = likes;
	}
	return post;
}

function arrify(object) {
	let arr = [];
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			// const element = object[key]

			arr.push({ [key]: object[key] });
		}
	}
	return arr;
}

let u1 = { nickname: 'u1', _id: 'id1' };
let u2 = { nickname: 'u2', _id: 'id2' };
let u3 = { nickname: 'u3', _id: 'id3' };

let p1 = { description: 'd1', media: [] };
let p4 = { description: 'd4', media: ['url4', 'url5', 'url6'] };

let uNot = { nickname: '', _id: 'id6' };

let pNoMedia = { description: 'dqwe', media: [] };
let pNoDesc = { description: '', media: ['url'] };
let pNot = { something: 2 };

// let fr = { description: 'friends', media: [] , level: 'friends'}
let fr1 = { description: 'friends1', media: [], level: 'friends' };
let fr2 = { description: 'friends2', media: [], level: 'friends' };
let fr3 = { description: 'friends3', media: [], level: 'friends' };

// let pr = { description: 'private', media: [], level: 'private'}
let pr1 = { description: 'private1', media: [], level: 'private' };
let pr2 = { description: 'private2', media: [], level: 'private' };
let pr3 = { description: 'private3', media: [], level: 'private' };

// let pb = { description: 'public', media: [], level: 'public' }
let pb1 = { description: 'public1', media: [], level: 'public' };
let pb2 = { description: 'public2', media: [], level: 'public' };
let pb3 = { description: 'public3', media: [], level: 'public' };

function addPosts(u, pArr) {
	let ar = [];
	pArr.forEach(async (element) => {
		// log(element)
		ar.push(Service.addPost(u, element));
	});
	return Promise.all(ar);
	// return new Promise((resolve, reject) => {
	// 	resolve();
	// });
}

describe('service-post', () => {
	// beforeEach(async () => {

	// })
	describe('.addPost', () => {
		it('normal, add', async () => {
			let a = await Service.addPost(u1, p1);
			expect(arrify(a.post)).to.have.deep.members(
				arrify(addPostMiscelFields(p1))
			);
			expect(arrify(a.user)).to.have.deep.members(arrify(u1));
		});

		// it('normal, no post.description add', async () => {
		// })

		// it('normal, no post.media add', async () => {
		// })

		// it('abnormal, both fields empty post add', async () => {
		// })

		// it('abnormal, invalid user add', async () => {
		// })
	});
	describe('.removePost', () => {
		it('normal remove', async () => {
			let a = await Service.addPost(u1, p1);
			// log(a)
			let b = await Service.removePost(a._id);
			// log(b)
		});
	});
	describe('.getPosts', () => {
		it("get all of mine and friends except friends' private post", async () => {
			await addPosts(u1, [fr1, pb1, pr1]);
			await addPosts(u2, [fr2, pb2, pr2]);
			await addPosts(u3, [fr3, pb3, pr3]);

			let a = await Service.getPosts(u1, [u2, u3], 7);

			let posts = a.map((el) => {
				return el.post;
			});
			posts = posts.map((e) => {
				return { description: e.description, media: e.media, level: e.level };
			});

			let expPosts = [fr1, pb1, fr2, pb2, fr3, pb3, pr1];
			expect(posts).to.have.deep.members(expPosts);
		});
	});

	describe('getPublicPosts', () => {
		it("get lastests 'n' public posts", async () => {
			await addPosts(u1, [pr1, pb2]);
			let postTest = await Service.addPost(u1, pb1);
			await addPosts(u2, [pr2, pb1, pb2]);
			await addPosts(u3, [pr3, pb1, pb2]);
			await Service.incrementReaction(postTest._id, 'love');
			await Service.incrementReaction(postTest._id, 'haha');
			await Service.incrementReaction(postTest._id, 'love');
			await Service.incrementReaction(postTest._id, 'love');
			await Service.incrementReaction(postTest._id, 'love');

			let a = await Service.getPublicPosts(2);
			log(a);
			// a = a.map((e) => {
			// 	return e.post;
			// });
			// a = a.map((e) => {
			// 	return { description: e.description, media: e.media, level: e.level };
			// });
			// expect.
			// expect(a.length).to.equal(2);
			// expect(a).to.
		});
	});
});
