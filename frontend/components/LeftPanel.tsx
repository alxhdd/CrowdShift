import { User } from "../types";

interface Props {
  user: User;
  onSnapshotChange: (idx: number) => void;
}

export default function LeftPanel({ user, onSnapshotChange }: Props) {
  if (user.role === "speaker") return <SpeakerLeftPanel user={user} onSnapshotChange={onSnapshotChange} />;
  if (user.role === "organizer") return <OrganizerLeftPanel />;
  if (user.role === "sponsor") return <SponsorLeftPanel />;
  return null;
}

import SpeakerLeftPanel from "./speaker/SpeakerLeftPanel";
import OrganizerLeftPanel from "./organizer/OrganizerLeftPanel";
import SponsorLeftPanel from "./sponsor/SponsorLeftPanel";
