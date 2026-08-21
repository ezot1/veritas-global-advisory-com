import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSubmissions from "./tools/list-submissions";
import getSubmission from "./tools/get-submission";
import updateSubmissionStatus from "./tools/update-submission-status";
import listBriefings from "./tools/list-briefings";
import shareStats from "./tools/share-stats";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "veritas-global-advisory",
  title: "Veritas Global Advisory",
  version: "0.1.0",
  instructions:
    "Tools for Veritas Global Advisory. Review inquiries from the contact, careers and talent-network forms, update their status, read published research briefings, and inspect article share analytics. Access runs as the signed-in user, so admin-only data requires an admin account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listSubmissions, getSubmission, updateSubmissionStatus, listBriefings, shareStats],
});
