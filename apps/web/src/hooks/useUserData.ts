import { useContext } from "react";

import { DataContext } from "../contexts/DataContext";

export function useUserData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useUserData deve ser usado dentro de DataProvider.");
  }

  return context;
}
