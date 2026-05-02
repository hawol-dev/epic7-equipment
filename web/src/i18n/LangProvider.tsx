"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { type Lang, type MessageKey, t as translate } from "./messages";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "lang";

export function LangProvider({
  children,
  initialLang = "ko",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  // 서버에서 cookie 기반으로 결정한 initialLang을 그대로 사용 → flash 없음
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    // Provider 밖에서 호출되면 기본값 반환 (안전)
    return { lang: "ko", setLang: () => {} };
  }
  return ctx;
}

export function useT() {
  const { lang } = useLang();
  return useCallback(
    (key: MessageKey) => translate(key, lang),
    [lang]
  );
}
