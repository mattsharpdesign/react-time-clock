import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

var config = {
  apiKey: "AIzaSyAYCaOQw0gDHySugvZOBZFe-eImvt9z9cQ",
  authDomain: "timeclock-testing.firebaseapp.com",
  databaseURL: "https://timeclock-testing.firebaseio.com",
  projectId: "timeclock-testing",
  storageBucket: "timeclock-testing.appspot.com",
  messagingSenderId: "170289627623"
};

console.log('Initializing Firebase app');
firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
const firestoreSettings = { timestampsInSnapshots: true };
db.settings(firestoreSettings);

export const storage = firebase.storage();