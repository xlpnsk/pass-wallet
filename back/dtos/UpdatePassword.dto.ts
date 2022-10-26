export class UpdatePasswordDto{
  id: number
  masterPassword: string
  password?: string | undefined
  webAddress: string | undefined
  description: string | undefined
  login: string | undefined
}