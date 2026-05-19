"use client";

import { Check, Copy, LogOut, Plus, Shield, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Guest, GuestType } from "@/lib/types";

type Props = {
  initialAuthed: boolean;
};

const typeLabels: Record<GuestType, string> = {
  single: "单人",
  couple: "夫妇",
  family: "家庭",
  custom: "自定义"
};

export function AdminPanel({ initialAuthed }: Props) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [password, setPassword] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState("");
  const [honorific, setHonorific] = useState("先生");
  const [displayName, setDisplayName] = useState("");
  const [guestType, setGuestType] = useState<GuestType>("single");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const suggestedDisplayName = useMemo(() => {
    const trimmed = guestName.trim();
    if (!trimmed) {
      return "";
    }
    if (guestType === "couple") {
      return honorific === "伉俪" ? `${trimmed}伉俪` : `${trimmed}${honorific}`;
    }
    if (guestType === "family") {
      return honorific === "全家" ? `${trimmed}全家` : `${trimmed}${honorific}`;
    }
    return `${trimmed}${honorific}`;
  }, [guestName, honorific, guestType]);

  const loadGuests = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/guests");
      if (response.ok) {
        const data = await response.json();
        setGuests(data.guests);
      } else {
        setError("宾客列表加载失败，请重新登录后再试");
      }
    } catch {
      setError("网络异常，宾客列表加载失败");
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadGuests();
    }
  }, [authed, loadGuests]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        setError("密码不正确");
        return;
      }
      setAuthed(true);
      setPassword("");
    } catch {
      setError("网络异常，登录失败");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthed(false);
    setGuests([]);
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          honorific,
          displayName: displayName.trim() || suggestedDisplayName,
          guestType
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "生成失败");
        return;
      }

      const data = await response.json();
      setGuests((items) => [data.guest, ...items]);
      setGuestName("");
      setDisplayName("");
      setNotice("专属请柬已生成");
      window.setTimeout(() => setNotice(""), 1800);
    } catch {
      setError("网络异常，生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string) {
    try {
      const response = await fetch(`/api/admin/guests/${id}/toggle`, { method: "POST" });
      if (!response.ok) {
        setError("状态更新失败");
        return;
      }
      const data = await response.json();
      setGuests((items) => items.map((item) => (item.id === id ? data.guest : item)));
    } catch {
      setError("网络异常，状态更新失败");
    }
  }

  async function copyLink(code: string) {
    const link = `${origin}/i/${code}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(code);
      setNotice("链接已复制");
    } catch {
      window.prompt("复制这个专属请柬链接", link);
      setNotice("请手动复制链接");
    } finally {
      window.setTimeout(() => {
        setCopied("");
        setNotice("");
      }, 1600);
    }
  }

  if (!authed) {
    return (
      <main className="phone-shell flex min-h-dvh items-center justify-center bg-[#f8efe4] px-5 text-wine">
        <form className="w-full" onSubmit={login}>
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cinnabar text-ivory">
              <Shield size={28} />
            </div>
            <h1 className="mt-5 font-serif text-3xl font-black">请柬后台</h1>
            <p className="mt-2 text-sm text-wine/60">请输入管理员密码</p>
          </div>
          <input
            className="tap-target w-full rounded-2xl border border-wine/15 bg-white px-4 py-3 text-base outline-none focus:border-cinnabar"
            type="password"
            value={password}
            placeholder="管理员密码"
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="mt-3 text-sm text-cinnabar">{error}</p> : null}
          {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
          <button
            className="tap-target mt-5 w-full rounded-full bg-cinnabar px-4 py-3 font-bold text-ivory disabled:opacity-60"
            disabled={busy}
          >
            登录
          </button>
          <p className="mt-5 text-center text-xs leading-6 text-wine/45">本地默认密码是 admin123，上线请配置 ADMIN_PASSWORD。</p>
        </form>
      </main>
    );
  }

  return (
    <main className="phone-shell min-h-dvh bg-[#f8efe4] text-wine">
      <header className="sticky top-0 z-10 border-b border-wine/10 bg-[#f8efe4]/92 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-cinnabar/70">ADMIN</p>
            <h1 className="font-serif text-2xl font-black">宾客请柬</h1>
          </div>
          <button
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-wine/15 bg-white text-wine"
            aria-label="退出登录"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="px-5 py-5">
        <form className="rounded-3xl bg-white p-4 shadow-[0_16px_50px_rgba(99,19,19,0.12)]" onSubmit={create}>
          <div className="flex items-center gap-2 font-bold">
            <Plus size={18} className="text-cinnabar" />
            新增宾客
          </div>

          <label className="mt-4 block text-sm font-bold text-wine/70">宾客姓名</label>
          <input
            className="tap-target mt-2 w-full rounded-2xl border border-wine/12 bg-[#fbf7f1] px-4 py-3 outline-none focus:border-cinnabar"
            value={guestName}
            placeholder="例如：张伟 / 张伟、李娜"
            onChange={(event) => setGuestName(event.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-wine/70">类型</label>
              <select
                className="tap-target mt-2 w-full rounded-2xl border border-wine/12 bg-[#fbf7f1] px-3 py-3 outline-none"
                value={guestType}
                onChange={(event) => {
                  const value = event.target.value as GuestType;
                  setGuestType(value);
                  setHonorific(value === "couple" ? "伉俪" : value === "family" ? "全家" : "先生");
                }}
              >
                <option value="single">单人</option>
                <option value="couple">夫妇</option>
                <option value="family">家庭</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-wine/70">尊称</label>
              <input
                className="tap-target mt-2 w-full rounded-2xl border border-wine/12 bg-[#fbf7f1] px-3 py-3 outline-none"
                value={honorific}
                onChange={(event) => setHonorific(event.target.value)}
              />
            </div>
          </div>

          <label className="mt-4 block text-sm font-bold text-wine/70">请柬显示称呼</label>
          <input
            className="tap-target mt-2 w-full rounded-2xl border border-wine/12 bg-[#fbf7f1] px-4 py-3 outline-none focus:border-cinnabar"
            value={displayName}
            placeholder={suggestedDisplayName || "最终展示给宾客的称呼"}
            onChange={(event) => setDisplayName(event.target.value)}
          />

          {error ? <p className="mt-3 text-sm text-cinnabar">{error}</p> : null}
          {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}

          <button
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-4 py-3 font-bold text-ivory disabled:opacity-60"
            disabled={busy}
          >
            <Plus size={18} />
            生成专属请柬
          </button>
        </form>
      </section>

      <section className="space-y-3 px-5 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-black">宾客列表</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-wine/60">{guests.length} 位</span>
        </div>

        {guests.map((guest) => (
          <article key={guest.id} className="rounded-3xl bg-white p-4 shadow-[0_12px_38px_rgba(99,19,19,0.1)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                <UserRound size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words font-serif text-lg font-black">{guest.displayName}</h3>
                    <p className="mt-1 text-xs text-wine/48">{typeLabels[guest.guestType]} · {guest.honorific}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${guest.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {guest.isActive ? "有效" : "已停用"}
                  </span>
                </div>
                <p className="mt-3 break-all rounded-2xl bg-[#fbf7f1] px-3 py-2 text-xs text-wine/58">
                  {origin}/i/{guest.inviteCode}
                </p>
                <div className="mt-3 grid grid-cols-[1fr_88px] gap-2">
                  <button
                    className="tap-target flex items-center justify-center gap-2 rounded-full bg-cinnabar px-3 py-2 text-sm font-bold text-ivory"
                    onClick={() => copyLink(guest.inviteCode)}
                  >
                    {copied === guest.inviteCode ? <Check size={17} /> : <Copy size={17} />}
                    {copied === guest.inviteCode ? "已复制" : "复制链接"}
                  </button>
                  <button
                    className="tap-target flex items-center justify-center gap-1 rounded-full border border-wine/15 px-3 py-2 text-sm font-bold text-wine/70"
                    onClick={() => toggle(guest.id)}
                  >
                    {guest.isActive ? <X size={16} /> : <Check size={16} />}
                    {guest.isActive ? "停用" : "启用"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-wine/45">
                  回复状态：{guest.rsvpStatus === "pending" ? "未回复" : guest.rsvpStatus === "attending" ? "确认出席" : "无法出席"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
