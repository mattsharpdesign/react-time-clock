import { decorate, observable } from "mobx";

class Store {
  
  settings = {};

  constructor() {
    console.log('Store constructed', this.settings);
  }

}

decorate(Store, {
  settings: observable
});

export default Store;