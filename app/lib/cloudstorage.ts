const request = require('request');
const gcloud = require('google-cloud');
const path = require('path');

import Config from '../config'

const CLOUD_BUCKET = Config.get('CLOUD_BUCKET');
const SERVICE_KEY = (typeof Config.get('GOOGLE_SERVICE_KEY') === 'string') ? JSON.parse(Config.get('GOOGLE_SERVICE_KEY')) : Config.get('GOOGLE_SERVICE_KEY');

const storage = gcloud({
  projectId: Config.get('GCLOUD_PROJECT'),
  credentials: SERVICE_KEY,
}).storage();

const bucket = storage.bucket(CLOUD_BUCKET);

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
export function getPublicUrl (filename: string) {
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
export function upload (data: any, cb: (e?: Error) => any) {
  if (!data) {
    return cb();
  }
  const file = bucket.file(data.gcsname);
  const stream = file.createWriteStream();

  stream.on('error', function (e: Error) {
    cb(e);
  });

  stream.on('finish', function () {
    cb();
  });

  stream.end(data.buffer);
}
