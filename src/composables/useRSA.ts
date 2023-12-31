import { JSEncrypt } from 'jsencrypt'

const RSAPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7kJLyPYbClBoOm4ah9gDz6HB8
voYFVv26Z1vDHG6yPuT0vms13rDFTRUqy9Rj8ESeUUUmHehyziP6Q0y/uVDcnS02
uYziaYtewsDWU8ShK6wR2cpxtGHArRcZwnEPV++7GJZUISjr2RYp5av/sJTnWOd4
Dd8SJwu+Vvn+C1DbdQIDAQAB
-----END PUBLIC KEY-----`

export default function useRSA() {
  const JSEncryptor = new JSEncrypt()

  const init = () => {
    JSEncryptor.setPublicKey(RSAPublicKey)
  }

  init()

  const encryption = (val: any) => JSEncryptor.encrypt(val.toString())

  return { encryption }
}
