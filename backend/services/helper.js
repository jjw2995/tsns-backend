// let emailMsg = { email: 'must be valid email addr' };
// let passMsg = {
//   password:
//     'must contain #, lowercase, UPPERCASE, speci@l, and be 8 characters long',
// };
// let nickMsg = {
//   nickname: 'must be 2~16 characters long and not contain special characters',
// };

// function checkErrInsert(clause, errMsg, errArr = []) {
//   if (!clause) {
//     errArr.push(errMsg);
//   }
//   return errArr;
// }

// // #####
// function isValidPassword(password, errArr) {
//   const test = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(
//     String(password)
//   );
//   return checkErrInsert(test, passMsg, errArr);
// }

// // must at least contain one #, lowercase, UPPERCASE, speci@l ch@r@cter, and 8 characters long'
// function isValidEmail(email, errArr) {
//   const test = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
//     String(email).toLowerCase()
//   );
//   return checkErrInsert(test, emailMsg, errArr);
// }

// function isValidNick(nickname, errArr) {
//   const test = /^[a-zA-Z0-9 ]{2,16}$/.test(String(nickname));
//   return checkErrInsert(test, nickMsg, errArr);
// }

// module.exports = {
//   isValidPassword,
//   isValidEmail,
//   isValidNick,
// };
