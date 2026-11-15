import { useParams } from "react-router-dom";
import { usePartner } from "../store";
import { PageHead, Surface } from "../ui";

export default function Notifications() {
  const { section = "all" } = useParams();
  const { notifications, markRead, markAllRead } = usePartner();
  const rows = notifications.filter((note) => section === "all" || note.type === section);

  return (
    <div>
      <PageHead
        title="Notifications"
        description="Read and unread notices for this brand."
        action={<button type="button" className="btn-soft" onClick={markAllRead}>Mark all read</button>}
      />
      <Surface>
        <ul>
          {rows.map((note) => (
            <li key={note.id} className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
              <div>
                <p className={`text-sm ${note.read ? "text-gray-600" : "font-semibold text-gray-900"}`}>{note.title}</p>
                <p className="text-xs text-gray-500">{note.body}</p>
                <p className="mt-1 text-[11px] text-gray-400">{note.type} · {note.at.replace("T", " ").slice(0, 16)}</p>
              </div>
              <button type="button" className="btn-soft" onClick={() => markRead(note.id, !note.read)}>{note.read ? "Mark unread" : "Mark read"}</button>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
