import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export function resolveAttachmentPath(attachment: string): string {
  const normalized = attachment.replace(/\\/g, "/").replace(/^images[\\/]/, "");
  return path.join(process.cwd(), "uploads", "images", normalized);
}
