import * as functions from 'firebase-functions';
import * as path from 'path';
import * as os from 'os';
import { db } from './init';
const mkdirp = require('mkdir-promise');
const spawn = require('child-process-promise').spawn;
const rimraf = require('rimraf');

const { Storage } = require('@google-cloud/storage');

const gcs = new Storage();

export const resizeThumbnail = functions.storage
  .object()
  .onFinalize(async (object, context) => {
    const fileFullPath = object.name || '',
      contentType = object.contentType || '',
      fileDir = path.dirname(fileFullPath),
      fileName = path.basename(fileFullPath),
      tempLocalDir = path.join(os.tmpdir(), fileDir);

    console.log(
      'Thumbnail generation started: ',
      fileFullPath,
      fileDir,
      fileName
    );

    if (!contentType.startsWith('image/') || fileName.startsWith('thumb_')) {
      console.log('Exiting image processing');
      return null;
    }

    await mkdirp(tempLocalDir);

    const bucket = gcs.bucket(object.bucket);
    const originalImageFile = bucket.file(fileFullPath);

    const tempLocalFile = path.join(os.tmpdir(), fileFullPath);
    await originalImageFile.download({ destination: tempLocalFile });
    console.log('Downloaded image to: ', tempLocalFile);

    // Generate a thumbnail using ImageMagick
    const outputFilePath = path.join(fileDir, 'thumb_' + fileName);
    const outputFile = path.join(os.tmpdir(), outputFilePath);
    console.log('Generating a thumbnal to:', outputFile);
    await spawn(
      'convert',
      [tempLocalFile, '-thumbnail', '510x287 >', outputFile],
      { capture: ['stdout', 'stderr'] }
    );

    //Upload the thumbnail to storage
    const metadata = {
      contentType: object.contentType,
      cacheControl: 'public, max-age=2592000, s-maxage=2592000',
    };
    console.log(
      'Uploading the thumbnail to stoage:',
      outputFile,
      outputFilePath
    );
    const uploadedFiles = await bucket.upload(outputFile, {
      destination: outputFilePath,
      metadata,
    });

    // Delete local files to avoid overloading
    rimraf.sync(tempLocalDir);

    // Delete original file uploaded by user
    await originalImageFile.delete();

    // Create link to thumbnail
    const thumbnail = uploadedFiles[0];
    const url = thumbnail.getSignedUirl({
      action: 'read',
      expires: new Date(3000, 0, 1),
    });
    console.log('Generated signed url:', url);

    //Save thumbnail link to database
    const frags = fileFullPath.split('/'),
      courseId = frags[1];
    console.log('Saving Url to Database:', courseId);
    return db.doc(`courses/${courseId}`).update({ uploadedImageUrl: url });
  });
