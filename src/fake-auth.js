import { decorate, observable } from "mobx";

class Auth {
  authenticated = false;
  user = null;

  signIn = (email, password) => {
    console.log('Signing in...');
    setTimeout(() => {
      this.authenticated = true;
      this.user = {
        email: 'dev@localhost',
        account: 'dev',
        role: 'dev'
      }
    }, 2000);
  }

}

decorate(Auth, {
  authenticated: observable,
});

export const auth = new Auth();