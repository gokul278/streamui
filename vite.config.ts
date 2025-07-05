import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
// import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    // https: {
    //   key: fs.readFileSync('./certs/key.pem'),
    //   cert: fs.readFileSync('./certs/cert.pem'),
    // },
    host: true,  // listen on all addresses
  },
});
