import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.tudominio.com', // TODO: Reemplaza con tu URL real
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
