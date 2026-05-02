"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** 외부 (URL 등) 동기화용 현재 값 */
  value: string;
  /** 디바운스된 변경값 — URL 업데이트 등에 사용 */
  onChange: (next: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * 한글 IME 안전한 검색 입력 (uncontrolled)
 *
 * 핵심: 입력 필드를 controlled 로 두면 React 리렌더 시 value prop이 다시 들어가면서
 * IME 조합 상태가 깨진다. 또 한글 마지막 음절은 compositionEnd가 안 떠서 (사용자가
 * 명시적으로 종료할 때까지) controlled value 가 늦게 갱신된다.
 *
 * 해결: defaultValue 로 초기화하고 input value를 ref로만 다룸. onInput 마다 디바운스해서
 * 외부에 통보. 외부에서 명시적으로 value가 바뀌면 (예: 초기화 버튼) 그때만 input 동기화.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  debounceMs = 250,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmittedRef = useRef(value);

  // 외부 value가 우리가 마지막으로 emit한 값과 다르면 (외부에서 강제 변경 — 초기화 등) 동기화
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
      lastEmittedRef.current = value;
    }
  }, [value]);

  const flush = (v: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastEmittedRef.current = v;
      onChange(v);
    }, debounceMs);
  };

  // 마운트 해제 시 디바운스 즉시 flush (네비게이션 등)
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="search"
      defaultValue={value}
      placeholder={placeholder}
      onInput={(e) => flush(e.currentTarget.value)}
      onBlur={(e) => {
        // 블러 시 즉시 flush
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const v = e.currentTarget.value;
        lastEmittedRef.current = v;
        onChange(v);
      }}
      className={className}
    />
  );
}
