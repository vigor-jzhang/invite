"use client";

import { ExternalLink, ImageDown, LogOut, Plus, Shield, Trash2, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Guest, GuestType } from "@/lib/types";

type Props = {
  initialAuthed: boolean;
};

const typeLabels: Record<GuestType, string> = {
  male: "男性",
  female: "女性",
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
  const [guestType, setGuestType] = useState<GuestType>("male");
  const [error, setError] = useState("");
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

  async function deleteGuest(id: string, displayName: string) {
    const confirmed = window.confirm(`确定删除 ${displayName} 的请柬吗？删除后后台不再显示，该专属链接也会失效。`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("删除失败");
        return;
      }
      setGuests((items) => items.filter((item) => item.id !== id));
      setNotice("宾客已删除");
      window.setTimeout(() => setNotice(""), 1600);
    } catch {
      setError("网络异常，删除失败");
    }
  }

  function openInvite(code: string) {
    window.open(`${origin}/i/${code}`, "_blank", "noopener,noreferrer");
  }

  function openInviteImage(code: string) {
    window.open(`${origin}/api/invites/${code}/image`, "_blank", "noopener,noreferrer");
  }

  if (!authed) {
    return (
      <main className="phone-shell flex min-h-dvh items-center justify-center !bg-[#fff8df] px-5 text-slate-900">
        <form className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]" onSubmit={login}>
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
              <Shield size={28} />
            </div>
            <h1 className="mt-5 text-3xl font-black">请柬后台</h1>
            <p className="mt-2 text-sm text-slate-900/60">请输入管理员密码</p>
          </div>
          <input
            className="tap-target w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500"
            type="password"
            value={password}
            placeholder="管理员密码"
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
          <button
            className="tap-target mt-5 w-full rounded-full bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-60"
            disabled={busy}
          >
            登录
          </button>
          <p className="mt-5 text-center text-xs leading-6 text-slate-900/45">本地默认密码是 admin123，上线请配置 ADMIN_PASSWORD。</p>
        </form>
      </main>
    );
  }

  return (
    <main className="phone-shell min-h-dvh !bg-[#fff8df] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-amber-200 bg-[#fff8df]/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-blue-600/70">ADMIN</p>
            <h1 className="text-2xl font-black">宾客请柬</h1>
          </div>
          <button
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900"
            aria-label="退出登录"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="px-5 py-5">
        <form className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)]" onSubmit={create}>
          <div className="flex items-center gap-2 font-bold">
            <Plus size={18} className="text-blue-600" />
            新增宾客
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-900/70">宾客姓名</label>
          <input
            className="tap-target mt-2 w-full rounded-2xl border border-slate-300 bg-[#fffdf5] px-4 py-3 outline-none focus:border-blue-500"
            value={guestName}
            placeholder="例如：张伟 / 张伟、李娜"
            onChange={(event) => setGuestName(event.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900/70">类型</label>
              <select
                className="tap-target mt-2 w-full rounded-2xl border border-slate-300 bg-[#fffdf5] px-3 py-3 outline-none focus:border-blue-500"
                value={guestType}
                onChange={(event) => {
                  const value = event.target.value as GuestType;
                  setGuestType(value);
                  setHonorific(
                    value === "female"
                      ? "女士"
                      : value === "couple"
                        ? "伉俪"
                        : value === "family"
                          ? "全家"
                          : value === "custom"
                            ? "女士/先生"
                            : "先生"
                  );
                }}
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="couple">夫妇</option>
                <option value="family">家庭</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900/70">尊称</label>
              <input
                className="tap-target mt-2 w-full rounded-2xl border border-slate-300 bg-[#fffdf5] px-3 py-3 outline-none focus:border-blue-500"
                value={honorific}
                onChange={(event) => setHonorific(event.target.value)}
              />
            </div>
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-900/70">请柬显示称呼</label>
          <input
            className="tap-target mt-2 w-full rounded-2xl border border-slate-300 bg-[#fffdf5] px-4 py-3 outline-none focus:border-blue-500"
            value={displayName}
            placeholder={suggestedDisplayName || "最终展示给宾客的称呼"}
            onChange={(event) => setDisplayName(event.target.value)}
          />

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}

          <button
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-60"
            disabled={busy}
          >
            <Plus size={18} />
            生成专属请柬
          </button>
        </form>
      </section>

      <section className="space-y-3 px-5 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">宾客列表</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900/60">{guests.length} 位</span>
        </div>

        {guests.map((guest) => (
          <article key={guest.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_38px_rgba(15,23,42,0.07)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                <UserRound size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-black">{guest.displayName}</h3>
                    <p className="mt-1 text-xs text-slate-900/48">{typeLabels[guest.guestType]} · {guest.honorific}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${guest.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {guest.isActive ? "有效" : "已停用"}
                  </span>
                </div>
                <p className="mt-3 break-all rounded-2xl bg-[#fffdf5] px-3 py-2 text-xs text-slate-900/58">
                  {origin}/i/{guest.inviteCode}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    className="tap-target flex items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                    onClick={() => openInvite(guest.inviteCode)}
                  >
                    <ExternalLink size={17} />
                    跳转至请柬
                  </button>
                  <button
                    className="tap-target flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
                    onClick={() => openInviteImage(guest.inviteCode)}
                  >
                    <ImageDown size={17} />
                    生成图片
                  </button>
                </div>
                <div className="mt-2">
                  <button
                    className="tap-target flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                    onClick={() => deleteGuest(guest.id, guest.displayName)}
                  >
                    <Trash2 size={17} />
                    删除宾客
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-900/45">
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
