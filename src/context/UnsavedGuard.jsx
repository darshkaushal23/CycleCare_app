import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useLocation } from "react-router-dom";

const UnsavedGuardContext = createContext({
  dirty: false,
  message: "",
  setGuard: () => {},
  confirmLeave: () => true,
});

export function UnsavedGuardProvider({ children }) {
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const prompted = useRef(false);
  const skipBlock = useRef(false);
  const location = useLocation();

  useEffect(() => {
    skipBlock.current = false;
  }, [location.pathname, location.search]);

  const setGuard = useCallback((nextDirty, nextMessage = "") => {
    setDirty(Boolean(nextDirty));
    setMessage(nextMessage);
  }, []);

  const confirmLeave = useCallback(() => {
    const allowed = !dirty ? true : window.confirm(message || "You have unsaved changes. Leave this page?");
    if (allowed && dirty) skipBlock.current = true;
    return allowed;
  }, [dirty, message]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !skipBlock.current &&
      (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  );

  useEffect(() => {
    if (blocker.state !== "blocked") {
      prompted.current = false;
      return undefined;
    }
    if (prompted.current) return undefined;
    prompted.current = true;
    const allowed = window.confirm(message || "You have unsaved changes. Leave this page?");
    if (allowed) blocker.proceed();
    else blocker.reset();
    return undefined;
  }, [blocker, message]);

  const value = useMemo(
    () => ({ dirty, message, setGuard, confirmLeave }),
    [dirty, message, setGuard, confirmLeave],
  );

  return <UnsavedGuardContext.Provider value={value}>{children}</UnsavedGuardContext.Provider>;
}

export function useUnsavedGuard() {
  return useContext(UnsavedGuardContext);
}
