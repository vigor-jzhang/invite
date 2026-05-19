export default function InviteNotFound() {
  return (
    <main className="phone-shell flex min-h-dvh items-center justify-center bg-wine px-6 text-center">
      <section className="rounded-3xl border border-gold/40 bg-cinnabar/60 p-7 shadow-glow">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 font-serif text-3xl text-gold">
          囍
        </div>
        <h1 className="mt-5 font-serif text-2xl font-black text-ivory">请柬暂时无法打开</h1>
        <p className="mt-3 text-sm leading-7 text-ivory/72">这个专属链接不存在或已经失效，请联系邀请人确认。</p>
      </section>
    </main>
  );
}
