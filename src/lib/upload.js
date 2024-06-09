import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";
import crypto from 'crypto';

const hashFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const hash = crypto.createHash('sha256');
      hash.update(new Uint8Array(buffer));
      resolve(hash.digest('hex'));
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
};

const upload = async (file) => {
  try {
    const hash = await hashFile(file);
    const storageRef = ref(storage, `images/${hash + file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          reject("Something went wrong!" + error.code);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  } catch (error) {
    console.error('Error generating file hash:', error);
  }
};

export default upload;
