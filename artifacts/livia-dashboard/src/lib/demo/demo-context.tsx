import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getPersona, type Persona, type PersonaId } from "./personas";

const STORAGE_KEY = "livia.demoPersona";

interface DemoContextValue {
  personaId: PersonaId | null;
  persona: Persona | null;
  setPersona: (id: PersonaId | null) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const v = window.localStorage.getItem(STORAGE_KEY) as PersonaId | null;
      return v && getPersona(v) ? v : null;
    } catch {
      return null;
    }
  });

  const setPersona = (id: PersonaId | null) => {
    setPersonaIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  };

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const v = e.newValue as PersonaId | null;
        if (v && getPersona(v)) setPersonaIdState(v);
        else setPersonaIdState(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persona = personaId ? getPersona(personaId) ?? null : null;

  return (
    <DemoContext.Provider value={{ personaId, persona, setPersona }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
