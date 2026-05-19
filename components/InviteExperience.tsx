"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Guest, WeddingConfig } from "@/lib/types";

type Props = {
  guest: Guest;
  wedding: WeddingConfig;
};

export function InviteExperience({ guest, wedding }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <main className="phone-shell min-h-dvh bg-wine">
      <section className="relative min-h-dvh overflow-hidden bg-[url('/invitation-bg.png')] bg-cover bg-center px-5 py-5">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-wine/8 to-wine/35" />
        <motion.div
          className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full border border-gold/40 bg-gold/10 blur-sm"
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.6, repeat: Infinity }}
        />

        {!opened ? (
          <motion.div
            className="relative z-10 flex min-h-[calc(100dvh-40px)] flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-full rounded-[28px] border border-gold/50 bg-gradient-to-br from-cinnabar via-[#8d1919] to-wine p-6 shadow-glow"
              initial={{ y: 28, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/60 bg-gold/10 font-serif text-4xl font-black text-gold">
                囍
              </div>
              <p className="font-serif text-sm tracking-[0.35em] text-gold/90">CELEBRATION BANQUET</p>
              <h1 className="gold-text mt-4 font-serif text-3xl font-black">{wedding.banquetTitle}</h1>
              <p className="mt-5 font-serif text-lg font-bold leading-8 text-ivory/88">{wedding.hostLine}</p>
              <button
                className="tap-target mt-8 w-full rounded-full border border-gold/70 bg-gold px-5 py-3 font-serif text-base font-bold text-wine shadow-glow"
                onClick={() => setOpened(true)}
              >
                开启请柬
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="relative z-10 mx-auto flex min-h-[calc(100dvh-40px)] flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.header
              className="pt-7 text-center"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 }}
            >
              <p className="font-serif text-xs tracking-[0.42em] text-gold">INVITATION</p>
              <h1 className="gold-text mt-3 font-serif text-4xl font-black">{wedding.banquetTitle}</h1>
              <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </motion.header>

            <motion.section
              className="mt-6 px-5 py-4 text-center"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
            >
              <p className="font-serif text-lg font-bold tracking-[0.35em] text-gold/85">诚邀</p>
              <h2 className="font-kai gold-text mt-4 break-words text-4xl font-black">{guest.displayName}</h2>
              <p className="mt-6 font-serif text-lg font-bold leading-9 text-ivory drop-shadow">
                莅临
                <br />
                <span className="gold-text font-serif text-2xl font-bold">张俭伟先生 与 吴晓坤女士</span>
                <br />
                良缘答谢宴
              </p>
              <p className="mt-6 font-serif text-lg font-bold leading-9 text-ivory drop-shadow">
                谨备薄宴
                <br />
                恭候光临
              </p>
              <div className="gold-text mt-7 space-y-2 font-serif text-xl font-bold leading-8">
                <p>张俭伟父母</p>
                <p>张勤业 王淑敏 敬邀</p>
              </div>
            </motion.section>

            <motion.section
              className="mt-4 space-y-5 px-6 text-center font-serif text-ivory drop-shadow"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42 }}
            >
              <div>
                <div className="mb-2 flex items-center justify-center gap-2 text-gold/85">
                  <CalendarDays size={18} />
                  <span className="text-sm font-bold tracking-[0.25em]">时间</span>
                </div>
                <p className="text-lg font-bold leading-8">{wedding.dateText}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-center gap-2 text-gold/85">
                  <MapPin size={18} />
                  <span className="text-sm font-bold tracking-[0.25em]">地点</span>
                </div>
                <p className="text-lg font-bold leading-8">{wedding.venueName}</p>
                <p className="text-base leading-7 text-ivory/82">{wedding.address}</p>
              </div>
              <div className="pt-1 text-base font-bold leading-8 text-ivory/86">
                <p>良辰同此日</p>
                <p>嘉礼谢亲朋</p>
                <p>花开并蒂日</p>
                <p>月照两家春</p>
                <p>薄酒酬厚谊</p>
                <p>清欢待故人</p>
              </div>
            </motion.section>

            <footer className="mt-auto py-7 text-center font-serif text-sm leading-7 text-ivory/78">
              <Sparkles className="mx-auto mb-2 text-gold" size={18} />
              {wedding.hostLine}
            </footer>
          </motion.div>
        )}
      </section>
    </main>
  );
}
