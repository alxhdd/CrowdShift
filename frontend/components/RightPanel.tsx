import { User } from "../types";

interface Props {
  user: User;
}

export default function RightPanel({ user }: Props) {
  if (user.role === "speaker") return <SpeakerRightPanel user={user} />;
  if (user.role === "organizer") return <OrganizerRightPanel />;
  if (user.role === "sponsor") return <SponsorRightPanel />;
  return null;
}

import SpeakerRightPanel from "./speaker/SpeakerRightPanel";
import OrganizerRightPanel from "./organizer/OrganizerRightPanel";
import SponsorRightPanel from "./sponsor/SponsorRightPanel";
