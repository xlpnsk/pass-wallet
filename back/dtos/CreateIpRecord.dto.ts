export class CreateIpRecordDto{
  ipAddress: string
  blockedUntil?: Date
  isBlockedPermanently?: boolean
}