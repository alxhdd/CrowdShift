import { createContext, useContext } from "react";

export interface DashboardContextType {
  talkId: number | null;
  snapshotIdx: number;
  setSnapshotIdx: (idx: number) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  talkId: null,
  snapshotIdx: 0,
  setSnapshotIdx: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
