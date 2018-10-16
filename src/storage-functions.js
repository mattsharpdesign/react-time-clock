import { auth, storage } from './firebase-services';
import shortid from 'shortid';

export function uploadUserProfilePic(accountId, userId, pic) {
  return new Promise((resolve, reject) => {
    const picId = shortid.generate();
    const path = [
      'accounts',
      accountId,
      'users',
      userId,
      picId + '.jpg'
    ].join('/');
    const ref = storage.ref(path);
    ref.put(pic)
      .then(() => {
        console.log('Image uploaded')
        ref.getDownloadURL()
          .then(url => {
            console.log('Download url', url);
            resolve(url);
          })
          .catch(err => reject(err));
      })
      .catch(err => console.error(err));
  });
}
