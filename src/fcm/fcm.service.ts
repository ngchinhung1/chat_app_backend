import {Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
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