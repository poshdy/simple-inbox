export const encodeBaseUrl = (content: string) => {
  return Buffer.from(content).toString("base64url");
};
