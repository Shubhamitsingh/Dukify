import { usePartner } from "../store";
import { Empty, PageHead, Surface } from "../ui";
import { formatDate } from "../lib/metrics";

const copy = {
  all: ["All notifications", "Unread items stay highlighted until you mark them."],
  order: ["Order updates", "New orders and shipment notices."],
  product: ["Product updates", "Availability notes from the central catalogue."],
  payment: ["Payment updates", "Settlement windows and payout notes."],
  store: ["Store updates", "Drafts and publish reminders."],
  announcement: ["Platform announcements", "Messages from Pahachan."],
};

export default function NotificationsPage({ section }) {
  const partner = usePartner();
  const [title, description] = copy[section];
  const rows = partner.notifications.filter((note) => section === "all" || note.type === section);

  return (
    <div>
      <PageHead
        title={title}
        description={description}
        action={<button type="button" className="btn-soft" onClick={partner.markAllRead}>Mark all read</button>}
      />
      <Surface title="Inbox">
        {rows.length === 0 ? <Empty title="No notices" body="This filter has no notifications for the brand." /> : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((note) => (
              <li key={note.id} className={`flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4 ${note.read ? "" : "bg-pink-50/60 dark:bg-pink-950/20"}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-gray-500">{note.body}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDate(note.at.slice(0, 10))} · {note.type}</p>
                </div>
                <button type="button" className="btn-soft w-fit shrink-0" onClick={() => partner.markRead(note.id, !note.read)}>
                  {note.read ? "Mark unread" : "Mark read"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}

NotificationsPage.moduleId = "notifications";
