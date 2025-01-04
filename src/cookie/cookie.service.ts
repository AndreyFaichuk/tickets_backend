import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { UserDocument } from 'src/schemas/users.schemas';

@Injectable()
export class CookieService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey = process.env.DATABASE_URL;
  private readonly ivLength = 16;

  private readonly oneHourInMilliseconds = 3600 * 1000; // One hour
  private readonly thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000; // Thirty days

  cookieAge(isRememberMe: boolean): number {
    return isRememberMe
      ? this.thirtyDaysInMilliseconds
      : this.oneHourInMilliseconds;
  }

  encryptData(data: string): string {
    const key = crypto
      .createHash('sha256')
      .update(this.secretKey)
      .digest('base64')
      .substr(0, 32);

    const iv = crypto.randomBytes(this.ivLength); // Генерация случайного IV
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  decryptData(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto
      .createHash('sha256')
      .update(this.secretKey)
      .digest('base64')
      .substr(0, 32);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key),
      iv,
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  setCookie(res: Response, name: string, user: UserDocument) {
    const cookieExpiredAfter = this.cookieAge(user.isRememberMe);

    const userData = {
      userId: user._id,
      expiry: new Date(Date.now() + cookieExpiredAfter).toISOString(),
    };

    const stringifiedUserData = JSON.stringify(userData);

    const encryptedData = this.encryptData(stringifiedUserData);
    res.cookie(name, encryptedData, { maxAge: cookieExpiredAfter });
  }

  validateCookie(req: Request, cookieName: string): string | null {
    const cookie = req.cookies[cookieName];
    if (cookie) {
      try {
        return this.decryptData(cookie);
      } catch (error) {
        console.error('Error decrypting cookie:', error);
        return null;
      }
    }
    return null;
  }
}
