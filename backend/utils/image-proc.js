const { v4: uuidv4 } = require("uuid");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const gc = new Storage({
  projectId: "clever-spirit-285705",
  keyFilename: path.join(__dirname, "../../gcs.json"),
  // credentials: JSON.parse(process.env.GCS_KEYFILE),
});
// let a = path.join(__dirname, "../../gcs.json");
// log(a);
// for-tsns@clever-spirit-285705.iam.gserviceaccount.com
const gcsBucket = gc.bucket("tsns");
const jimp = require("jimp");
const { promises } = require("fs");

module.exports = class ImageProc {
  _modifyPictures(files) {
    return files.map((file) => {
      return new Promise((resolve, reject) => {
        jimp.read(file.path, (err, val) => {
          if (err) {
            return reject(this._error(400, "file not of image-type"));
          }

          val.contain(720, 720).quality(60).write(file.path);
          resolve(file.path);
        });
      });
    });
  }

  _error(status, error) {
    return { status: status, error: error };
  }

  _uploadFile(filePath, dest) {
    return new Promise((resolve, reject) => {
      gcsBucket
        .upload(filePath, { destination: dest, public: false })
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          log(e);
          reject(this._error(500, "internal server error"));
        });
    });
  }

  removeFiles(media) {
    return new Promise((resolve, reject) => {
      media = media.map((id) => {
        return gcsBucket.file(id).delete();
      });
      Promise.all(media).then(() => {
        // log("helolololol");
        resolve();
      });
    });
  }

  uploadFiles(files) {
    return new Promise((resolve, reject) => {
      if (files.length > 4) {
        return reject(this._error(400, "4 images max"));
      }

      files = this._modifyPictures(files);
      Promise.all(files)
        .then((r) => {
          files = r.map((path) => {
            return this._uploadFile(path, uuidv4() + ".png");
          });
          Promise.all(files)
            .then((r) => {
              r = r.map((file) => {
                return file[0].id;
              });
              resolve(r);
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => reject(e));
    });
  }

  // getImgUrlsForMedium(medium = []) {
  //   return new Promise((resolve, reject) => {
  //     let promArr = [];
  //     medium.forEach((media) => {
  //       this.getImgUrls(media);
  //     });
  //     Promise.all(promArr)
  //       .then((r) => resolve(r))
  //       .catch((e) => reject(e));
  //   });
  // }
  getImgUrls(media) {
    return new Promise((resolve, reject) => {
      let temp = media.map((id) => {
        return gcsBucket
          .file(id)
          .getSignedUrl({ expires: Date.now() + 720000, action: "read" });
      });
      Promise.all(temp)
        .then((r) => {
          resolve(
            r.map((nested) => {
              return nested[0];
            })
          );
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
};
