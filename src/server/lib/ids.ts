const CROCKFORD = "0123456789abcdefghjkmnpqrstvwxyz";

const hex = (bytes: Uint8Array) =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

export const uuidv7 = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let time = Date.now();
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = time % 256;
    time = Math.floor(time / 256);
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const value = hex(bytes);
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

export const ulid = () => {
  let time = Date.now();
  let encodedTime = "";
  for (let index = 0; index < 10; index += 1) {
    encodedTime = `${CROCKFORD[time % 32] ?? "0"}${encodedTime}`;
    time = Math.floor(time / 32);
  }
  const random = [...crypto.getRandomValues(new Uint8Array(16))]
    .map((byte) => CROCKFORD[byte & 31] ?? "0")
    .join("");
  return `${encodedTime}${random}`;
};
