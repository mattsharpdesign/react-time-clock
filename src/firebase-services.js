import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

var config = {
  apiKey: "AIzaSyDSsYkAs3468LoL3b2GkcF2EsM2uyzvpeg",
  authDomain: "onlinetimekeeper.firebaseapp.com",
  databaseURL: "https://onlinetimekeeper.firebaseio.com",
  projectId: "onlinetimekeeper",
  storageBucket: "onlinetimekeeper.appspot.com",
  messagingSenderId: "298832097505"
};
console.log('Initializing Firebase app');
firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
const firestoreSettings = { timestampsInSnapshots: true };
db.settings(firestoreSettings);

export const storage = firebase.storage();