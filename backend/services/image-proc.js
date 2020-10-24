// const { v4: uuidv4 } = require("uuid");
// const { Storage } = require("@google-cloud/storage");
// const path = require("path");
// const gc = new Storage({
//   keyFilename: path.join(__dirname, "../../gcs.json"),
//   projectId: "clever-spirit-285705",
// });

// // for-tsns@clever-spirit-285705.iam.gserviceaccount.com
// const gcsBucket = gc.bucket("tsns");
// const jimp = require("jimp");
// // const os = require("os");

// function modifyPictures(files) {
//   return files.map((file) => {
//     return new Promise((resolve, reject) => {
//       jimp.read(file.path, (err, val) => {
//         if (err) {
//           return reject(error(400, "file not of image-type"));
//         }

//         val.contain(720, 720).quality(60).write(file.path);
//         resolve(file.path);
//       });
//     });
//   });
// }

// function error(status, error) {
//   return { status: status, error: error };
// }

// function uploadFile(filePath, dest) {
//   return new Promise((resolve, reject) => {
//     gcsBucket
//       .upload(filePath, { destination: dest, public: false })
//       .then((r) => {
//         resolve(r);
//       })
//       .catch((e) => {
//         log(e);
//         reject(error(500, "internal server error"));
//       });
//   });
// }

// function removeFiles(media) {
//   return new Promise((resolve, reject) => {
//     media = media.map((id) => {
//       return gcsBucket.file(id).delete();
//     });
//     Promise.all(media).then(() => {
//       resolve();
//     });
//   });
// }

// function uploadFiles(files) {
//   return new Promise((resolve, reject) => {
//     if (files.length > 4) {
//       return reject(error(400, "4 images max"));
//     }

//     files = modifyPictures(files);
//     Promise.all(files)
//       .then((r) => {
//         files = r.map((path) => {
//           return uploadFile(path, uuidv4() + ".png");
//         });
//         Promise.all(files)
//           .then((r) => {
//             r = r.map((file) => {
//               return file[0].id;
//             });
//             resolve(r);
//           })
//           .catch((e) => {
//             reject(e);
//           });
//       })
//       .catch((e) => reject(e));
//   });
// }

// const gcsUrl = "https://storage.cloud.google.com/tsns/";

// function getImgUrls(media) {
//   return new Promise((resolve, reject) => {
//     let temp = media.map((id) => {
//       return gcsBucket
//         .file(id)
//         .getSignedUrl({ expires: Date.now() + 7200000, action: "read" });
//     });
//     Promise.all(temp)
//       .then((r) => {
//         resolve(
//           r.map((nested) => {
//             return nested[0];
//           })
//         );
//       })
//       .catch((e) => {
//         reject(e);
//       });
//   });
// }
