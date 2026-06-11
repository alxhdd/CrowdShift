import { User } from "../types";
import ErrorBoundary from "./ErrorBoundary";

interface Props {
  user: User;
}

export default function RightPanel({ user }: Props) {
  if (user.role === "speaker") return <ErrorBoundary><SpeakerRightPanel user={user} /></ErrorBoundary>;
  if (user.role === "organizer") return <ErrorBoundary><OrganizerRightPanel /></ErrorBoundary>;
  if (user.role === "sponsor") return <ErrorBoundary><SponsorRightPanel /></ErrorBoundary>;
  return null;
}

import SpeakerRightPanel from "./speaker/SpeakerRightPanel";
import OrganizerRightPanel from "./organizer/OrganizerRightPanel";
import SponsorRightPanel from "./sponsor/SponsorRightPanel";
