const enc = new TextEncoder();


async function hashString(password) {
  
    var result = await crypto.subtle.digest("SHA-256", enc.encode(password))
  
    return new Uint8Array(result)
  
}
  
const currentTimeSeconds = () => {
    return Math.round(Date.now() / 1000); 
}

  
function generateRandomTextKey(length) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let key = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      key += chars[array[i] % chars.length];
    }
    return key;
}

module.exports = {hashString, generateRandomTextKey, currentTimeSeconds}