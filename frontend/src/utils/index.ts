export function generateRandomNonce(length = 8) {
  let nonce = "";
  const chars = "0123456789";
  for (let i = 0; i < length; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
