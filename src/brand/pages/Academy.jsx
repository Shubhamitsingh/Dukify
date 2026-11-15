import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { lessons } from "../data/seed";
import { usePartner } from "../store";
import { PageHead, Surface } from "../ui";

export default function Academy() {
  const { section = "start" } = useParams();
  const { lessons: done, completeLesson } = usePartner();
  const rows = lessons.filter((lesson) => lesson.group === section);
  const [open, setOpen] = useState(rows[0]?.id || null);
  useEffect(() => setOpen(rows[0]?.id || null), [section]);

  return (
    <div>
      <PageHead title="Brand growth and academy" description="Short lessons for selling on Pahachan. Completion is saved in this browser." />
      <div className="grid gap-3">
        {rows.map((lesson) => (
          <Surface key={lesson.id} padded>
            <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === lesson.id ? null : lesson.id)}>
              <span>
                <span className="block text-sm font-semibold">{lesson.title}</span>
                <span className="text-xs text-gray-500">{lesson.minutes} min read {done[lesson.id] ? "· completed" : ""}</span>
              </span>
            </button>
            {open === lesson.id ? (
              <div className="mt-3">
                <p className="text-sm leading-6 text-gray-600">{lesson.body}</p>
                <button type="button" className="btn-primary mt-3" onClick={() => completeLesson(lesson.id)}>Mark complete</button>
              </div>
            ) : null}
          </Surface>
        ))}
      </div>
    </div>
  );
}
