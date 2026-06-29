import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.24"],
};

export default withEve(nextConfig);
