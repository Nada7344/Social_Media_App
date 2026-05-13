import * as admin from 'firebase-admin';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class NotificationService {
    private client: admin.app.App;

    constructor() {
        if (admin.apps.length) {
            this.client = admin.app();
        } else {
            var serviceAccount = JSON.parse(
                readFileSync(
                    resolve('./src/config/social-media-app-4d94c-firebase-adminsdk-fbsvc-8957c725d9.json')
                ) as unknown as string
            );

            this.client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
    }


    async sendNotfication(
        { token,
            data: {
                title,
                body
            }
        }: {
            token: string,
            data: {
                title: string,
                body: string
            }
        }
    ) {
        const message = {
            token,
            data: {
                title,
                body
            }
        }
        return await this.client.messaging().send(message)
    }


     async sendNotfications(
        { tokens,
            data 
        }: {
            tokens: string[],
            data: {
                title: string,
                body: string
            }
        }
    ) {
        await Promise.allSettled(
            tokens.map(token=>{
                 return  this.sendNotfication({token ,data})
            })
        )
       
    }
}

export const notificationService =new NotificationService();