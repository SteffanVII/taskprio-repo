import * as crypto from "crypto"

function base64UrlEncode(buffer : Buffer<ArrayBufferLike>) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function generatePKCE() : { verifier : string, challenge : string } {

  const randomBytes = crypto.randomBytes(32)
  const verifier = base64UrlEncode(randomBytes)
  const hash = crypto.createHash("sha256").update(verifier).digest();
  const challenge = base64UrlEncode(hash)

  return {verifier, challenge}

}