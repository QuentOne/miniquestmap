const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function randomMapCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
