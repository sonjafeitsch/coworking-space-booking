import { LoaderArgs, json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import { getEvents } from "~/models/events";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { Button, Link, TextField } from "~/components";
import { ErrorAlert } from "~/components/ErrorAlert";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale("de");

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const timezone = parseInt(url.searchParams.get("timezone") || "");
  if (!start || !end) {
    return json({ events: [] });
  }
  const events = await getEvents(
    dayjs(start).utcOffset(timezone).format("YYYYMMDDTHHmmss"),
    dayjs(end).utcOffset(timezone).format("YYYYMMDDTHHmmss")
  );
  return json({ events });
};

function Events({
  start,
  end,
  timezone,
}: {
  start: string;
  end: string;
  timezone: number;
}) {
  const data = useLoaderData<typeof loader>();

  return data.events.length > 0 ? (
    <div>
      <div className="font-semibold">
        Leider belegt. Folgende parallele Veranstaltungen wurden gefunden:
      </div>
      <ul className="list-disc mt-2">
        {data.events.map((event, i) => (
          <li key={i}>
            {dayjs(event.start).format("LLL")} – {dayjs(event.end).format("LT")}
            : {event.summary}
          </li>
        ))}
      </ul>
    </div>
  ) : start && end ? (
    <div className="flex flex-col gap-4 content-start">
      <p className="text-base leading-6 text-themed-base-text">
        Dein Wunschtermin ist verfügbar. Du kannst ihn jetzt in unserem
        Buchungskalender reservieren.
      </p>
      <Link href={`/book?start=${start}&end=${end}&timezone=${timezone}`}>
        Jetzt reservieren
      </Link>
    </div>
  ) : (
    <></>
  );
}

function CheckDateForm({ error }: { error?: string }) {
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const { state } = useNavigation();

  const timezoneOffset = new Date().getTimezoneOffset();

  return (
    <div className="flex flex-col justify-start w-full p-16 sm:p-0 sm:w-1/2 gap-8">
      <div className="lg:max-w-lg">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
          Meine Buchung
        </h1>
        <p className="mt-6 text-base leading-6 text-themed-base-text">
          Gib den Wunschzeitraum für Deine Veranstaltung ein. Prüfe mit einem
          Klick ob sie verfügbar ist.
        </p>
      </div>
      {error && <ErrorAlert error={error} />}
      <Form className="flex flex-col items-start gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <TextField
            className="flex-grow"
            label="Von"
            id="start"
            name="start"
            type="datetime-local"
            defaultValue={start}
          />
          <TextField
            className="flex-grow"
            label="Bis"
            id="end"
            name="end"
            type="datetime-local"
            defaultValue={end}
          />
          <input
            type="hidden"
            id="timezone"
            name="timezone"
            value={timezoneOffset.toString()}
          />
        </div>
        <Button type="submit">
          {state === "loading"
            ? "Events werden gesucht…"
            : "Verfügbarkeit prüfen"}
        </Button>
      </Form>
      {!error && <Events start={start} end={end} timezone={timezoneOffset} />}
    </div>
  );
}

export default function Index() {
  return <CheckDateForm />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage =
    "Ein unbekannter Fehler ist aufgetreten. Bitte lade die Seite einfach neu und probiere es erneut.";
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data;
  }

  return <CheckDateForm error={errorMessage} />;
}
