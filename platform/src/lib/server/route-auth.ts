import "server-only";
import { currentUser } from "./auth";
import { getProjectForUser } from "./repo";

/** Route-handler variant of requireProject: returns null instead of redirecting (callers send 404). */
export async function projectForRoute(projectId: string) {
  const user = await currentUser();
  if (!user) return null;
  const project = getProjectForUser(projectId, user.id);
  return project ? { user, project } : null;
}

export const notFoundResponse = () => new Response("Not found", { status: 404 });
