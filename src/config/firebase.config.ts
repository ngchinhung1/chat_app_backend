import * as admin from 'firebase-admin';
import {join} from 'path';

export function initializeFirebase() {
    if (!admin.apps.length) {
        const serviceAccount = require(join(__dirname, 'firebase-adminsdk.json'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ Firebase Admin initialized');
    }
}
