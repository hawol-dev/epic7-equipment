export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 text-xs text-[var(--text-muted)] leading-relaxed">
        <p>
          비공식 팬 사이트 · 게임/이미지 자산은{" "}
          <a
            href="https://epic7.onstove.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-secondary)]"
          >
            Smilegate Megaport
          </a>
          {" "}소유. 유효옵 데이터 출처: 디시인사이드 에픽세븐 마이너 갤러리 시트.
          이미지: Smilegate / Epic Seven (
          <a
            href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-secondary)]"
          >
            Fribbels Optimizer
          </a>
          {" "}경유 다운로드).
        </p>
      </div>
    </footer>
  );
}
