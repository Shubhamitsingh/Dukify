import { lessons } from "../data/seed";
import { usePartner } from "../store";
import { PageHead, Surface } from "../ui";

const copy = {
  start: ["Getting started", "How a brand partner uses Pahachan without running a warehouse."],
  setup: ["Brand setup guide", "Storefront, catalogue selection, and the first publish."],
  marketing: ["Marketing tutorials", "Promotions that stay inside central price rules."],
  selling: ["Product selling guides", "How to read supply price, MRP, and estimated margin."],
  growth: ["Business growth tips", "What to watch after the store is live."],
  videos: ["Training videos", "Written stand-ins for the training films."],
  announcements: ["Platform announcements", "Notes from Pahachan that every partner should read."],
};

export default function AcademyPage({ section }) {
  const partner = usePartner();
  const [title, description] = copy[section];
  const rows = lessons.filter((lesson) => lesson.group === section);

  return (
    <div>
      <PageHead title={title} description={description} />
      <div className="space-y-3">
        {rows.map((lesson) => (
          <Surface key={lesson.id} padded>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{lesson.title}</h2>
                <p className="mt-1 text-xs text-gray-500">{lesson.minutes} min read</p>
              </div>
              {partner.lessons[lesson.id] ? <span className="text-xs font-semibold text-emerald-700">Done</span> : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{lesson.body}</p>
            <button type="button" className="btn-soft mt-3" onClick={() => partner.completeLesson(lesson.id)}>Mark as read</button>
          </Surface>
        ))}
      </div>
    </div>
  );
}

AcademyPage.moduleId = "academy";
