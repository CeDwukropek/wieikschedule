import { useEffect, useState } from "react";
import { DEFAULT_CATALOG, loadRoomCatalog } from "./roomCatalog";

// The room catalog; the bundled one until (and unless) the CMS answers.
export function useRoomCatalog() {
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  useEffect(() => {
    let active = true;
    loadRoomCatalog().then(value => { if (active) setCatalog(value); });
    return () => { active = false; };
  }, []);
  return catalog;
}
