import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class CryptoService {

  public encryptPassword(masterPassword:string, password:string){
    const key = CryptoJS.MD5(masterPassword)
    const iv = CryptoJS.enc.Hex.parse(process.env.CRYPTO_IV);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key, { iv: iv }).ciphertext;
    return encryptedPassword.toString(CryptoJS.enc.Base64);
  }

  public decryptPassword(masterPassword:string, encryptedPassword:string){
    const key = CryptoJS.MD5(masterPassword)
    const iv = CryptoJS.enc.Hex.parse(process.env.CRYPTO_IV);

    const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, key, { iv: iv }).toString(CryptoJS.enc.Utf8)

    return decryptedPassword
  }

  public calculateSHA512(text:string){
    const hash = CryptoJS.SHA256(text)
    return hash;
  }

  public calculateHMAC(text:string){
    const hash = CryptoJS.HmacSHA256(text, process.env.HMAC_PASSPHRASE);
    return hash;
  }

  public validateMasterPassword(user: User, password:string){
    let isValid = false
    if(user.isPasswordKeptAsHash){
      //do SHA512 with salt and pepper check
      const salt = user.salt;
      const pepper = process.env.PEPPER;
      const hash = this.calculateSHA512(salt+password+pepper).toString();
      if(hash === user.passwordHash){
        isValid = true;
      }
    }
    else{
      //do HMAC check
      const hash = this.calculateHMAC(password).toString();
      if(hash === user.passwordHash){
        isValid = true;
      }
    }
    return isValid;
  }
}
