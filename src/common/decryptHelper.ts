import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as CryptoJS from "crypto-js";
import * as Dotenv from "dotenv";
Dotenv.config();

@Injectable()
export class DecryptHelper {
  async typeEncrypt(user_type: any) {
    try {
      const typeData = CryptoJS.AES.encrypt(
        JSON.stringify(user_type),
        process.env.CRYPTO_SECRET_KEY
      ).toString();
      return typeData;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error);
    }
  }

  async vendorIdEncrypt(user_type: any) {
    try {
      const typeData = CryptoJS.AES.encrypt(
        JSON.stringify(user_type),
        process.env.CRYPTO_SECRET_KEY
      ).toString();
      const urlEncodedEncrypted = encodeURIComponent(typeData);

      return urlEncodedEncrypted;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error);
    }
  }

  async vendorIdDecrypt(encryptedText: string) {
    try {
      const decoded = decodeURIComponent(encryptedText);

      const bytes = CryptoJS.AES.decrypt(
        decoded,
        process.env.CRYPTO_SECRET_KEY
      );

      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      return JSON.parse(decrypted);
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException("Invalid encrypted string");
    }
  }
}
