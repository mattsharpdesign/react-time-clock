import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
// import { Provider } from 'mobx-react';
// import Store from './Store';

// const store = new Store();

// ReactDOM.render(<Provider store={store} appVersion='dev'><App /></Provider>, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
