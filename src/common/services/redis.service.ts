import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config.js";
import { SubjectEnum } from "../enums/email.enum.js";
import { Types } from "mongoose";

export class RedisService {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: REDIS_URI
    })
    this.handelEvent()
  }

  private handelEvent() {
    this.client.on("error", (error) => console.log(`fail to connect on redis ${error}`))
    this.client.on("connect", () => console.log("REDIS CONNECT 💕"))
  }
  public async connect() {
    await this.client.connect();
  }



  public otpKey({ email, subject = SubjectEnum.ConfirmEmail }: { email: string, subject: SubjectEnum }): string {
    return `OTP::User::${email}::${subject}`;
  }


  public maxAttempOtpKey({ email, subject = SubjectEnum.ConfirmEmail }: { email: string, subject: SubjectEnum }): string {
    return `${this.otpKey({ email, subject })}::MaxTrial `;
  }

  blockOtpKey({ email, subject = SubjectEnum.ConfirmEmail }: { email: string, subject: SubjectEnum }): string {
    return `${this.otpKey({ email, subject })}::block `;
  }

  revokeTokenKey({ userId, jti }: { userId: Types.ObjectId | string, jti: string }): string {
    return `user:RevokeToken:${userId}:${jti}`;

  }

  revokeTokenKeyPrefix({ userId }: { userId: Types.ObjectId | string }): string {
    return `user:RevokeToken:${userId}`;
  }




  public async set({
    key,
    value,
    ttl = undefined
  }: {
    key: string;
    value: any;
    ttl?: number;
  }): Promise<any> {
    try {
      value = typeof value === "string" ? value : JSON.stringify(value);

      return ttl
        ? await this.client.set(key, value, { EX: ttl })
        : await this.client.set(key, value);

    } catch (error) {
      console.log(`Fail to set this redis query :: ${error}`);
    }
  }









  // UPDATE
  public async update({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number;
  }): Promise<boolean | string | null> {
    try {
      const exists = await this.client.exists(key);
      if (!exists) return false;

      const data = typeof value === "string" ? value : JSON.stringify(value);

      return ttl
        ? await this.client.set(key, data, { EX: ttl })
        : await this.client.set(key, data);
    } catch (error) {
      console.log(`fail in redis update operation ${error}`);
      return null;
    }
  }

  // GET
  public async get({
    key,
  }: {
    key: string;
  }): Promise<any> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error(`fail in redis get operation ${error}`);
      return null;
    }
  }

  // MGET
  public async mGet({
    keys,
  }: {
    keys: string[];
  }): Promise<(string | null)[] | null> {
    try {
      if (!keys.length) return [];
      return await this.client.mGet(keys);
    } catch (error) {
      console.log(`fail in redis mGet operation ${error}`);
      return null;
    }
  }

  // TTL
  public async ttl({
    key,
  }: {
    key: string;
  }): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.log(`fail in redis ttl operation ${error}`);
      return -1;
    }
  }

  // EXISTS
  public async exists({
    key,
  }: {
    key: string;
  }): Promise<number | null> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.log(`fail in redis exists operation ${error}`);
      return null;
    }
  }

  // INCR
  public async incr({
    key,
  }: {
    key: string;
  }): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.log(`fail in redis incr operation ${error}`);
      return null;
    }
  }

  // EXPIRE
  public async expire({
    key,
    ttl,
  }: {
    key: string;
    ttl: number;
  }): Promise<number | null> {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      console.log(`fail in redis expire operation ${error}`);
      return null;
    }
  }

  // KEYS BY PREFIX
  public async allKeysByPrefix(prefix: string): Promise<string[]> {
    try {
      return await this.client.keys(`${prefix}*`);
    } catch (error) {
      console.log(`fail in redis keys operation ${error}`);
      return [];
    }
  }

  // DELETE
  public async deleteKey({
    key,
  }: {
    key: string | string[];
  }): Promise<number | null> {
    try {
      if (!key.length) return 0;
      return await this.client.del(key);
    } catch (error) {
      console.log(`fail in redis delete operation ${error}`);
      return null;
    }
  }



}

export const redisService = new RedisService();