/**
 * ISOCYANATE SCAN
 * 
 * Tool for scanning the existing chemical registry and identifying
 * chemicals that contain diisocyanates
 */

import { Metadata } from "next";
import { IsocyanateScanClient } from "./isocyanate-scan-client";

export const metadata: Metadata = {
  title: "Isocyanate Scan | HMS Nova",
  description: "Scan the chemical registry for products containing diisocyanates",
};

export default function IsocyanateScanPage() {
  return <IsocyanateScanClient />;
}
