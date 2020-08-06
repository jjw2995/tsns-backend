const riend = require('mongoose').model('User')
const bcrypt = require('bcryptjs')

let log = (m) => console.log('\n', m, '\n')
let User

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

module.exports = class UserService {
    constructor (user) {
        User = user
    }

    async checkUser (id) {
        let user = await User.findById(id)
        return user
    }

}


