const request = require('request');
const gcloud = require('google-cloud');
const path = require('path');

const config = require('../config');
const logging = require('./logging');

const CLOUD_BUCKET = config.get('CLOUD_BUCKET');

const storage = gcloud.storage({
  projectId: config.get('GCLOUD_PROJECT'),
  credentials: (process.env.GOOGLE_SERVICE_KEY) ? JSON.parse(process.env.GOOGLE_SERVICE_KEY) : undefined
});
const bucket = storage.bucket(CLOUD_BUCKET);

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
function upload (data, cb) {
  if (!data) {
    return cb();
  }
  const file = bucket.file(data.gcsname);
  const stream = file.createWriteStream();

  stream.on('error', function (err) {
    cb(err);
  });

  stream.on('finish', function () {
    cb(null);
  });

  stream.end(data.buffer);
}

module.exports = {
  getPublicUrl: getPublicUrl,
  upload: upload,
};
