import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import SignIn from './SignIn';
import { auth, db } from './firebase-services';
import './index.css';
import { Provider } from 'mobx-react';
import Store from './Store';

const store = new Store();

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      store.setDatabaseRef(db.collection('accounts').doc(doc.data().account));
      ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
    });
  } else {
    ReactDOM.render(<SignIn />, document.getElementById('root'));
  }
});

// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
