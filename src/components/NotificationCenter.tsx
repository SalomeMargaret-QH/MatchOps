"use client";

import { useState, useEffect } from "react";
import { Bell, Heart, Eye, FileText, Loader2, CheckCircle2 } from "lucide-react";

// Tipado dinámico alineado a las interacciones y mensajes de tu esquema de Prisma
type SystemNotification = {
  id: string;
  type: "MATCH_SUCCESS" | "PROFILE_VIEW" | "APPLICATION_RECEIVED";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos la carga inicial (aquí conectarás tu fetch a /api/notifications)
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: "1",
          type: "MATCH_SUCCESS",
          title: "¡Hubo un Match Exitoso!",
          message: "La empresa revisó tu perfil y aceptó tu postulación. ¡Ya pueden iniciar una conversación!",
          time: "Hace 5 min",
          read: false
        },
        {
          id: "2",
          type: "PROFILE_VIEW",
          title: "Visitaron tu perfil",
          message: "Un reclutador corporativo ha visualizado tu situación laboral actual.",
          time: "Hace 2 horas",
          read: true
        }
      ]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="animate-spin text-moss" size={24} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-5 shadow-soft my-6">
      {/* CABECERA */}
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-moss" />
          <h2 className="text-base font-bold text-ink uppercase tracking-wider text-xs">
            Centro de Notificaciones
          </h2>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-moss hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* LISTA DE ALERTAS */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-ink/50 py-6">No tienes alertas pendientes.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 rounded-lg border p-3 transition-all ${
                notif.read ? "border-line bg-white opacity-80" : "border-moss/20 bg-moss/5 shadow-sm"
              }`}
            >
              {/* ICONOS DINÁMICOS SEGÚN EL TIPO */}
              <div className="mt-0.5 flex h-8 w-8 shrink-0 place-items-center justify-center rounded-full bg-white shadow-sm border border-line">
                {notif.type === "MATCH_SUCCESS" && <Heart size={15} className="text-coral fill-coral" />}
                {notif.type === "PROFILE_VIEW" && <Eye size={15} className="text-ink/60" />}
                {notif.type === "APPLICATION_RECEIVED" && <FileText size={15} className="text-moss" />}
              </div>

              {/* CONTENIDO DE LA ALERTA */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold text-ink ${!notif.read && "text-moss"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-ink/40 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}