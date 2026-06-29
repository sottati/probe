import type { NextConfig } from "next";
import { withEve } from "eve/next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

export default withEve(nextConfig);
