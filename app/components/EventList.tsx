import dayjs from "dayjs";
import { Link } from "./Link";
import { type Event } from "~/models/events";

export function EventList({
  events,
  formData,
}: {
  events: Event[];
  formData: { start: string; end: string; timezone: number };
}) {
  const { start, end, timezone } = formData;

  return events.length > 0 ? (
    <div>
      <div className="font-semibold">
        Leider ist der Raum zu folgenden Zeiten bereits belegt:
      </div>
      <ul className="list-disc mt-2">
        {events.map((event, i) => {
          return (
            <li key={i}>
              {dayjs(event.start).format("HH:mm")} –{" "}
              {dayjs(event.end).format("HH:mm")} Uhr
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    start && end && (
      <div className="flex flex-col gap-4 content-start">
        <p className="text-base leading-6 text-themed-base-text">
          Dein Wunschtermin ist verfügbar. Du kannst ihn jetzt in unserem
          Buchungskalender reservieren.
        </p>
        <Link href={`/book?start=${start}&end=${end}&timezone=${timezone}`}>
          Jetzt reservieren
        </Link>
      </div>
    )
  );
}
