"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const admin = __importStar(require("firebase-admin"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
class NotificationService {
    client;
    constructor() {
        if (admin.apps.length) {
            this.client = admin.app();
        }
        else {
            var serviceAccount = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)('./src/config/social-media-app-4d94c-firebase-adminsdk-fbsvc-8957c725d9.json')));
            this.client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
    }
    async sendNotfication({ token, data: { title, body } }) {
        const message = {
            token,
            data: {
                title,
                body
            }
        };
        return await this.client.messaging().send(message);
    }
    async sendNotfications({ tokens, data }) {
        await Promise.allSettled(tokens.map(token => {
            return this.sendNotfication({ token, data });
        }));
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
