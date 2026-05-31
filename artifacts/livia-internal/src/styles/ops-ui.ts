import type React from "react";
import { OPS_AMBER, OPS_BG, OPS_BORDER, OPS_TEXT } from "./platform-ops-tokens";

export const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${OPS_BORDER}`,
  background: OPS_BG,
  color: OPS_TEXT,
  fontSize: 14,
};

export const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: OPS_AMBER,
  color: OPS_BG,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};
