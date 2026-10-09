import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export function resolveAttachmentPath(attachment: string): string {
  const relative = attachment.replace(/^images[\\/]/, "");
  return path.join(UPLOADS_DIR, relative);
}
