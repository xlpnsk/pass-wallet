import { CreateIpRecordDto } from './CreateIpRecord.dto';

export class CreateLoginRecordDto {
  loginTime: Date;
  wasLoginSuccessful: boolean;
  attempt: number;
  userId: number;
  ipId?: number;
}
