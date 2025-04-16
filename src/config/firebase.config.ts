import * as admin from 'firebase-admin';

export function initializeFirebase() {
    if (!admin.apps.length) {
        const serviceAccount = require('../../src/config/firebase-adminsdk.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ Firebase Admin initialized');
    }
}
