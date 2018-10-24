import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import configs from './config/firebase-config.json';

const env = process.env.REACT_APP_FIREBASE_ENV || 'development'

firebase.initializeApp(configs[env]);

export const auth = firebase.auth();

export const db = firebase.firestore();
const firestoreSettings = { timestampsInSnapshots: true };
db.settings(firestoreSettings);

export const storage = firebase.storage();