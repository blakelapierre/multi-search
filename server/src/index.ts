import server from './server';


server()
  .then(() => console.log('success'))
  .catch(error => console.log('error', error));