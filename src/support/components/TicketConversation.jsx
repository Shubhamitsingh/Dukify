import { useState } from "react";
import { Clock3, Paperclip, SendHorizontal, StickyNote } from "lucide-react";
import { useStore } from "../../store";
import { formatTicketDate, initials } from "../model";

/** Same sky tokens as Orders / KPIs — no new blues. */
const CHAT = {
  canvas: "bg-sky-50/50 dark:bg-gray-950",
  shell: "border-sky-200 dark:border-sky-900/60",
  header: "border-sky-200 bg-white dark:border-sky-900/60 dark:bg-gray-900",
  label: "text-sky-700 dark:text-sky-300",
  staffBubble: "rounded-tr-md bg-sky-600 text-white",
  staffAvatar: "bg-sky-600 text-white",
  brandBubble: "rounded-tl-md border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
  brandAvatar: "bg-gray-600 text-white",
  customerBubble: "rounded-tl-md border border-indigo-100 bg-indigo-50 text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100",
  customerAvatar: "bg-indigo-500 text-white",
  internalBubble: "rounded-tr-md border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  internalAvatar: "bg-amber-400 text-amber-950",
  waiting: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200",
  send: "inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/20 transition hover:bg-sky-700 disabled:opacity-40",
  replyTab: "bg-sky-600 text-white",
  noteTab: "bg-amber-500 text-white",
  idleTab: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export function TicketConversation({ ticket, onReply }) {
  const { toast } = useStore();
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const messages = ticket?.messages || [];
  const waiting = ticket?.status === "Waiting for User";

  const send = () => {
    if (!body.trim() && !attachments.length) return;
    const note = attachments.length ? `\n\n[Attachments: ${attachments.join(", ")}]` : "";
    onReply(`${body.trim()}${note}`.trim(), internal);
    setBody("");
    setInternal(false);
    setAttachments([]);
  };

  return (
    <div className={`flex min-h-[32rem] flex-col overflow-hidden rounded-xl border shadow-[var(--app-shadow)] ${CHAT.shell} ${CHAT.canvas}`}>
      <div className={`border-b px-4 py-3 ${CHAT.header}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${CHAT.label}`}>Conversation desk</p>
          {waiting ? (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CHAT.waiting}`}>
              <Clock3 className="h-3 w-3" />
              Waiting on requester
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{ticket.description}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
        {messages.length ? (
          messages.map((message) => {
            const staff = message.authorType === "agent" || message.authorType === "admin";
            const brand = message.authorType === "brand" || (!staff && ticket.requesterType === "brand" && !message.internal);
            let bubble = CHAT.customerBubble;
            let avatar = CHAT.customerAvatar;
            if (message.internal) {
              bubble = CHAT.internalBubble;
              avatar = CHAT.internalAvatar;
            } else if (staff) {
              bubble = CHAT.staffBubble;
              avatar = CHAT.staffAvatar;
            } else if (brand) {
              bubble = CHAT.brandBubble;
              avatar = CHAT.brandAvatar;
            }

            return (
              <div key={message.id} className={`flex gap-2 ${staff || message.internal ? "flex-row-reverse" : "flex-row"}`}>
                <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${avatar}`}>
                  {initials(message.authorName)}
                </span>
                <div className={`max-w-[min(100%,28rem)] rounded-xl px-3.5 py-2.5 text-sm shadow-sm ${bubble}`}>
                  <div
                    className={`mb-1 flex flex-wrap items-center gap-2 text-[11px] ${
                      staff && !message.internal ? "text-sky-50/90" : "opacity-70"
                    }`}
                  >
                    <span className="font-semibold">{message.authorName}</span>
                    <span>{formatTicketDate(message.at)}</span>
                    {message.internal ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/90 px-1.5 py-0.5 font-semibold text-amber-950">
                        <StickyNote className="h-3 w-3" />
                        Internal
                      </span>
                    ) : null}
                    {!message.internal && staff ? (
                      <span className="rounded-full bg-white/15 px-1.5 py-0.5 font-semibold">Support</span>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap leading-5">{message.body}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">No conversation yet — send the first reply.</p>
        )}
      </div>

      <div className={`border-t bg-white p-3 dark:bg-gray-900 ${waiting ? "border-violet-200 dark:border-violet-900" : "border-sky-200 dark:border-sky-900/60"}`}>
        {waiting ? (
          <p className={`mb-2 rounded-xl border px-3 py-2 text-[11px] font-medium ${CHAT.waiting}`}>
            Ticket is waiting for the user — a public reply will move it back to In Progress.
          </p>
        ) : null}
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${!internal ? CHAT.replyTab : CHAT.idleTab}`}
            onClick={() => setInternal(false)}
          >
            Public reply
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${internal ? CHAT.noteTab : CHAT.idleTab}`}
            onClick={() => setInternal(true)}
          >
            <StickyNote className="h-3 w-3" />
            Internal note
          </button>
        </div>
        <textarea
          className={`input-field min-h-24 !rounded-xl ${
            internal
              ? "!border-amber-300 focus:!border-amber-500 focus:!ring-amber-500/20"
              : "!border-sky-200 focus:!border-sky-500 focus:!ring-sky-500/20"
          }`}
          placeholder={internal ? "Visible only to support staff…" : "Write a reply to the requester…"}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-gray-900 dark:text-sky-300"
            onClick={() => {
              const name = `evidence-${attachments.length + 1}.pdf`;
              setAttachments((current) => [...current, name]);
              toast(`Mock attachment queued: ${name}`);
            }}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </button>
          <button type="button" className={CHAT.send} disabled={!body.trim() && !attachments.length} onClick={send}>
            <SendHorizontal className="h-3.5 w-3.5" />
            {internal ? "Add note" : "Send reply"}
          </button>
        </div>
        {attachments.length ? <p className="mt-2 text-[11px] text-gray-500">Queued: {attachments.join(", ")}</p> : null}
      </div>
    </div>
  );
}
