import { redirect } from "next/navigation";

// Safety Committee meetings use the existing meetings module.
// Redirect to the meetings new page with a pre-filled type.
export default async function NewSafetyCommitteeMeetingPage() {
  redirect("/dashboard/meetings/new?type=safety-committee");
}
