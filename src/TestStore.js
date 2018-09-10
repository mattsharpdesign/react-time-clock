import { extendObservable } from 'mobx';

export default class TestStore {
  constructor() {
    extendObservable(this, {
      employees: [],
      loading: false
    });
  }
  fetchEmployees = () => {
    this.loading = true;
    this.employees = [
      { id: 1, firstName: 'Matt', lastName: 'Sampleson' },
      { id: 2, firstName: 'Holly', lastName: 'Teston' },
    ];
    setTimeout(() => this.loading = false, 1500);
  }
}