"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, MessageCircle, Loader2 } from "lucide-react";

type SystemNotification = {
  id: string;
  conversationId: string;
  title: string;
  message: string;
  time: string;
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<SystemNotification[] | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function load() {
    const response = await fetch("/api/notifications");
    const data = await response.json();
    if (response.ok) setNotifications(data.notifications);
  }

  const unreadCount = notifications?.length ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink/70 transition hover:bg-mist"
        title="Notificaciones"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-80 rounded-xl border border-line bg-white p-3 shadow-soft">
          <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/70">Notificaciones</p>
          </div>

          {notifications === null ? (
            <p className="flex items-center gap-2 p-3 text-sm text-ink/60">
              <Loader2 size={14} className="animate-spin" />
              Cargando...
            </p>
          ) : notifications.length === 0 ? (
            <p className="p-3 text-center text-sm text-ink/50">No tienes notificaciones nuevas.</p>
          ) : (
            <div className="max-h-80 space-y-1.5 overflow-y-auto">
              {notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={`/mensajes?conversationId=${notification.conversationId}`}
                  className="flex gap-2.5 rounded-lg border border-moss/20 bg-moss/5 p-2.5 transition hover:bg-moss/10"
                >
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white shadow-sm border border-line">
                    <MessageCircle size={13} className="text-moss" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-ink">{notification.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink/60">{notification.message}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
