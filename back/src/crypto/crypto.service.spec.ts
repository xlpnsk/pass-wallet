import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

const hmacCases = [
  ["jdsf%34dGeQ2", "00a846b9f10491d94e4908e790999fe563def9dfbcba21bb8c07895dfb00002d"],
  ["password", "a5fa91488b2c76ce85079c9a3580f6f7f4e408cd749facd46fac380c4b0e785d"],
  ["gTJWQ=214sXa3gHHDs%@sz1","adeb67b8646ebf24e0dc040f66c1290127aa009a38d9811c3532bb667d723c68"]
]

const sha512Cases = [
  ["password", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"],
  ["dgE#q3%=2AW2!", "775d082c425f2a9136100267294a72a257be771ce5593c4c378d10f084d579c8"],
  ["123!@#$wDsAQE79", "71131555a9cdb88969938fb887a351e4e75dfbb7393e7d896a46d777c829c6b4"]
]

const passEncryptCases = [
  ["JPZz3HWRAq","fy9MekZYrv","ujlhF3QArmtvl83jTOxLTA=="],
  ["23@aSW1FC","2234RSCwsd=-","TX9Ywum6uMV9xKxHSBN/iw=="],
  ["masterPassword", "password", "jTMRL6uST9Sbu97Eiqem8Q=="]
]

const passDecryptCases = [
  ["JPZz3HWRAq","ujlhF3QArmtvl83jTOxLTA==","fy9MekZYrv"],
  ["23@aSW1FC","TX9Ywum6uMV9xKxHSBN/iw==","2234RSCwsd=-"],
  ["masterPassword", "jTMRL6uST9Sbu97Eiqem8Q==", "password"]
]

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();
    Object.assign(process.env, {HMAC_PASSPHRASE: 'mystified cartridge dollar enigmatic', CRYPTO_IV: "101112131415161718191a1b1c1d1e1f"})
    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each(hmacCases)('calculateHMAC should return correct HMAC hash', (pass, expected) => {
    expect(service.calculateHMAC(pass).toString()).toBe(expected)
  });

  it.each(sha512Cases)('calculateSHA512 should return correct SHA512 hash', (pass, expected) => {
    expect(service.calculateSHA512(pass).toString()).toBe(expected);
  })

  it.each(passEncryptCases)('encryptPassword should return correct encrypted password as Base64', (masterPassword, password, expected) => {
    expect(service.encryptPassword(masterPassword,password)).toBe(expected)
  })

  it.each(passDecryptCases)('decryptPassword should return correct decrypted password as UTF8', (masterPassword, encryptedPassword, expected) => {
    expect(service.decryptPassword(masterPassword, encryptedPassword)).toBe(expected)
  })
});
