import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';


const serviceAccountPath = join(process.cwd(), 'takwira-d30cb-firebase-adminsdk-fbsvc-505f6ef2b1.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
console.log('ServiceAccount loaded = ', serviceAccount);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
