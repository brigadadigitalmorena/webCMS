import { useState, useCallback } from "react";

interface UseDisclosureResult<T> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
  /** Update the payload while the modal stays open (e.g. after a background refresh). */
  setData: (data: T | undefined) => void;
}

/**
 * Manages open/closed state for modals/drawers, optionally carrying typed data.
 *
 * @example
 * // Plain open/close
 * const modal = useDisclosure();
 * // <button onClick={modal.open}>Open</button>
 *
 * @example
 * // With payload
 * const editModal = useDisclosure<Survey>();
 * // editModal.open(survey) → editModal.data === survey
 */
export function useDisclosure<T = undefined>(): UseDisclosureResult<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((payload?: T) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Keep data until fully closed so animations/portals can still read it.
  }, []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const setDataDirect = useCallback((payload: T | undefined) => {
    setData(payload);
  }, []);

  return { isOpen, data, open, close, toggle, setData: setDataDirect };
}
