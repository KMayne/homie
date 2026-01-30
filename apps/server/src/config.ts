export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),

  // WebAuthn
  rpName: "Inventory App",
  rpID: process.env.RP_ID ?? "localhost",
  origin: process.env.ORIGIN ?? "http://localhost:5173",

  // Sessions
  sessionCookieName: "session",
  sessionMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // Storage
  dataDir: process.env.DATA_DIR ?? "./data",
};
