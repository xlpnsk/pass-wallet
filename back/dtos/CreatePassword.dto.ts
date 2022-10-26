export class CreatePasswordDto{
  masterPassword: string
  password: string
  webAddress: string | undefined
  description: string | undefined
  login: string | undefined
}