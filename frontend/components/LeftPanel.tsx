import { User } from "../types";

interface Props {
  user: User;
}

export default function LeftPanel({ user }: Props) {
  if (user.role === "speaker") return <SpeakerLeftPanel user={user} />;
  if (user.role === "organizer") return <OrganizerLeftPanel />;
  if (user.role === "sponsor") return <SponsorLeftPanel />;
  return null;
}

import SpeakerLeftPanel from "./speaker/SpeakerLeftPanel";
import OrganizerLeftPanel from "./organizer/OrganizerLeftPanel";
import SponsorLeftPanel from "./sponsor/SponsorLeftPanel";
