import {Injectable, OnModuleInit} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {initializeFirebase} from "../config/firebase.config";

@Injectable()
export class FcmService implements OnModuleInit {
    onModuleInit() {
        initializeFirebase();
    }

    async send(payload: admin.messaging.Message): Promise<string> {
        try {
            const response = await admin.messaging().send(payload);
            return response;
        } catch (error) {
            console.error('FCM send error:', error);
            throw error;
        }
    }
}