"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, MessageCircle, Navigation, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Guest, RsvpStatus, WeddingConfig } from "@/lib/types";

type Props = {
  guest: Guest;
  wedding: WeddingConfig;
};

export function InviteExperience({ guest, wedding }: Props) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<RsvpStatus>(guest.rsvpStatus);
  const [message, setMessage] = useState(guest.rsvpMessage);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function submitRsvp(nextStatus: RsvpStatus) {
    setSaving(true);
    setFeedback("");
    try {
      const response = await fetch(`/api/invites/${guest.inviteCode}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, message })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setFeedback(data?.error ?? "回复保存失败，请稍后再试");
        return;
      }

      const data = await response.json();
      setStatus(data.guest.rsvpStatus);
      setMessage(data.guest.rsvpMessage);
      setFeedback("回复已保存");
    } catch {
      setFeedback("网络异常，回复保存失败");
    } finally {
      setSaving(false);
    }
  }

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
              <p className="font-serif text-sm tracking-[0.35em] text-gold/90">WEDDING BANQUET</p>
              <h1 className="mt-4 font-serif text-3xl font-black text-ivory">婚礼答谢宴</h1>
              <p className="mt-5 text-sm leading-7 text-ivory/82">{wedding.hostLine}</p>
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
              <h1 className="mt-3 font-serif text-4xl font-black text-ivory">{wedding.banquetTitle}</h1>
              <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </motion.header>

            <motion.section
              className="mt-8 rounded-3xl border border-gold/50 bg-[#fff8ec]/92 px-5 py-7 text-center text-wine shadow-glow backdrop-blur"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
            >
              <p className="font-serif text-sm tracking-[0.4em] text-cinnabar/70">诚邀</p>
              <h2 className="mt-3 break-words font-serif text-3xl font-black text-cinnabar">{guest.displayName}</h2>
              <p className="mt-5 text-[15px] leading-8 text-wine/80">
                莅临我们的婚礼答谢宴
                <br />
                与我们共同分享这份喜悦
              </p>
              <p className="mt-5 font-serif text-xl font-bold text-cinnabar">{wedding.coupleNames}</p>
            </motion.section>

            <motion.section
              className="mt-5 space-y-3"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42 }}
            >
              <InfoRow icon={<CalendarDays size={20} />} title={wedding.dateText} detail={wedding.timeText} />
              <InfoRow icon={<MapPin size={20} />} title={wedding.venueName} detail={wedding.address} />
              <a
                className="tap-target flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 font-bold text-wine"
                href={wedding.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={18} />
                查看导航
              </a>
            </motion.section>

            <motion.section
              className="mt-5 rounded-3xl border border-gold/30 bg-wine/72 p-4 backdrop-blur"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.56 }}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gold">
                <MessageCircle size={17} />
                出席回复
              </div>
              <textarea
                className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-gold/30 bg-black/15 p-3 text-sm text-ivory outline-none placeholder:text-ivory/45"
                value={message}
                maxLength={200}
                placeholder="可以留下祝福或备注"
                onChange={(event) => setMessage(event.target.value)}
              />
              {feedback ? <p className="mt-2 text-xs text-ivory/68">{feedback}</p> : null}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  className="tap-target rounded-full bg-ivory px-3 py-3 text-sm font-bold text-cinnabar disabled:opacity-60"
                  disabled={saving}
                  onClick={() => submitRsvp("attending")}
                >
                  {status === "attending" ? "已确认出席" : "确认出席"}
                </button>
                <button
                  className="tap-target rounded-full border border-gold/60 px-3 py-3 text-sm font-bold text-gold disabled:opacity-60"
                  disabled={saving}
                  onClick={() => submitRsvp("declined")}
                >
                  {status === "declined" ? "已回复无法出席" : "无法出席"}
                </button>
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

function InfoRow({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-3xl border border-gold/30 bg-wine/72 p-4 backdrop-blur">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/18 text-gold">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="break-words font-serif text-base font-bold text-ivory">{title}</p>
        <p className="mt-1 break-words text-sm leading-6 text-ivory/72">{detail}</p>
      </div>
    </div>
  );
}
