import { LoaderArgs, json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { getEvents } from "~/models/events";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { Button, Link, TextField } from "~/components";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale("de");

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  if (!start || !end) {
    return json({ events: [] });
  }
  try {
    const events = await getEvents(
      dayjs(start).utc().format("YYYYMMDDTHHmmss"),
      dayjs(end).utc().format("YYYYMMDDTHHmmss")
    );
    return json({ events });
  } catch (error) {
    // throw error;
    return json({ events: [] });
  }
};

function Events({ start, end }: { start: string; end: string }) {
  const data = useLoaderData<typeof loader>();

  return data.events.length > 0 ? (
    <>
      <div className="font-semibold">
        Leider belegt. Folgende parallele Veranstaltungen wurden gefunden:
      </div>
      <ul>
        {data.events.map((event, i) => (
          <li key={i}>
            {dayjs(event.start).format("LLL")} – {dayjs(event.end).format("LT")}
            : {event.summary}
          </li>
        ))}
      </ul>
    </>
  ) : start && end ? (
    <div className="flex flex-col gap-4 content-start">
      <div className="font-semibold">Juhu, die Nische ist frei!</div>
      <Link href={`/book?start=${start}&end=${end}`}>Buchen</Link>
    </div>
  ) : (
    <></>
  );
}

export default function Index() {
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const { state } = useNavigation();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col justify-start w-1/2 gap-8">
        <div className="lg:max-w-lg">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
            Meine Buchung
          </h1>
          <p className="mt-6 text-base leading-6 text-themed-base-text">
            Gib den Wunschzeitraum für Deine Veranstaltung ein. Prüfe mit einem
            Klick ob sie verfügbar ist.
          </p>
        </div>
        <Form className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <TextField
              label="Von"
              id="start"
              name="start"
              type="datetime-local"
              defaultValue={start}
            />
            <TextField
              label="Bis"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              id="end"
              name="end"
              type="datetime-local"
              defaultValue={end}
            />
          </div>
          <Button type="submit">
            {state === "loading"
              ? "Events werden gesucht…"
              : "Verfügbarkeit prüfen"}
          </Button>
        </Form>
        <Events start={start} end={end} />
      </div>
    </div>
  );
}
