import { ActionArgs, json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { Event, getEvents } from "~/models/events";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { Button, Link, TextField } from "~/components";
import { ErrorAlert } from "~/components/ErrorAlert";
import invariant from "tiny-invariant";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale("de");

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const start = formData.get("start");
  const end = formData.get("end");
  const timezone = formData.get("timezone");

  if (!start || !end || !timezone) {
    return json({ events: [] });
  }

  invariant(typeof start === "string", "Startdatum muss ein Text sein.");
  invariant(typeof end === "string", "Enddatum muss ein Text sein.");
  invariant(typeof timezone === "string", "");

  const startFormatted = dayjs(start)
    .utcOffset(parseInt(timezone))
    .format("YYYYMMDDTHHmmss");
  const endFormatted = dayjs(end)
    .utcOffset(parseInt(timezone))
    .format("YYYYMMDDTHHmmss");

  const events = await getEvents(startFormatted, endFormatted);
  return json({ events, formData: { start, end, timezone } });
}

function Events({
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

function CheckDateForm({ error }: { error?: string }) {
  const { state } = useNavigation();
  const actionData = useActionData<typeof action>();

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
      <Form className="flex flex-col items-start gap-4" method="post">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <TextField
            className="flex-grow"
            label="Von"
            id="start"
            name="start"
            type="datetime-local"
          />
          <TextField
            className="flex-grow"
            label="Bis"
            id="end"
            name="end"
            type="datetime-local"
          />
          <input
            type="hidden"
            id="timezone"
            name="timezone"
            value={timezoneOffset.toString()}
          />
        </div>
        <Button type="submit">
          {state === "submitting"
            ? "Events werden gesucht…"
            : "Verfügbarkeit prüfen"}
        </Button>
      </Form>
      {!error && actionData?.events && actionData?.formData && (
        <Events formData={actionData.formData} events={actionData.events} />
      )}
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
