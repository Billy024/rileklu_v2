import { bindings } from "./bindings.server";

// Every admin server function checks this itself — never rely on the page
// UI alone to gate access, since server functions are independently
// callable HTTP endpoints.
export function verifyAdminPassword(password: string): boolean {
  const { ADMIN_PASSWORD } = bindings();
  if (!ADMIN_PASSWORD) return false;
  return password === ADMIN_PASSWORD;
}
