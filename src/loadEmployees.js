export function loadEmployees() {
  this.setState({ loading: true });
  this.props.db.collection('employees').orderBy('firstName').get().then(snapshot => {
    const employees = [];
    snapshot.docs.forEach(doc => {
      employees.push({ ...doc.data(), id: doc.id });
    });
    this.setState({ employees, loading: false });
  });
}
