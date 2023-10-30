import { redirect, type ActionArgs, json, Response } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Button, TextArea, TextField } from "~/components";
import { ErrorAlert } from "~/components/ErrorAlert";
import { createEvent } from "~/models/events";
import { createTicket, getUser } from "~/models/zammad";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const { eventname, email, message, start, end, timezone } =
    getFormData(formData);

  /**
   * Check if title and email are not empty
   */
  const errors = {
    title: eventname ? null : "Bitte gib den Titel deiner Veranstaltung ein.",
    email: email ? null : "Bitte gib deine E-Mail an.",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof eventname === "string", "Der Titel muss ein Text sein.");
  invariant(typeof start === "string", "Startdatum muss ein Text sein.");
  invariant(typeof end === "string", "Enddatum muss ein Text sein.");
  invariant(typeof email === "string", "Email muss ein Text sein.");
  invariant(typeof message === "string", "Message muss ein Text sein.");
  invariant(typeof timezone === "string", "Timezone muss ein Text sein.");

  const ticketBody = getTicketBody(start, end, message);

  const user = await getUser(email);
  const ticketNumber = await createTicket(user.email, eventname, ticketBody);
  await createEvent(eventname, start, end, timezone, ticketNumber);

  return redirect("/finished");
};

export default function SubmitEventForm({ error }: { error?: string }) {
  const [params] = useSearchParams();
  const start = params.get("start") || "";
  const end = params.get("end") || "";
  const timezone = params.get("timezone") || "";
  const event = params.get("eventname") || "";

  const { state } = useNavigation();

  return (
    <div className="flex flex-col justify-start w-full p-16 sm:p-0 sm:w-1/2 gap-8">
      <div className="flex flex-col justify-start lg:max-w-lg gap-4">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
          Reservierung bestätigen
        </h1>
        <p className="mt-6 text-base leading-6 text-themed-base-text">
          Trage den Namen deiner Veranstaltung ein und hinterlasse optional eine
          Nachricht an uns.
        </p>
        <p className="text-base leading-6 text-themed-base-text">
          <span className="font-semibold">Wichtig:</span> diese Reservierung ist
          noch keine finale Buchung. Wir bestätigen dir zeitnah deine
          Reservierung per E-Mail.
        </p>
      </div>
      {error && <ErrorAlert error={error} />}
      <Form className="flex flex-col items-start gap-4" method="post">
        <input type="hidden" name="start" defaultValue={start} />
        <input type="hidden" name="end" defaultValue={end} />
        <input type="hidden" name="timezone" defaultValue={timezone} />
        <TextField
          className="w-full"
          label="Name der Veranstaltung *"
          id="eventname"
          name="eventname"
          defaultValue={event}
        />
        <TextField
          className="w-full"
          label="E-Mail *"
          id="email"
          name="email"
        />
        <TextArea
          className="w-full"
          label="Nachricht (optional)"
          id="message"
          name="message"
        />
        <Button type="submit">
          {state === "submitting" ? "Wird reserviert…" : "Reservierung"}
        </Button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage =
    "Ein unbekannter Fehler ist aufgetreten. Bitte lade die Seite einfach neu und probiere es erneut.";
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data;
  }

  return <SubmitEventForm error={errorMessage} />;
}

/**
 * Some helper functions
 */
function getFormData(formData: FormData) {
  const eventname = formData.get("eventname");
  const email = formData.get("email");
  const message = formData.get("message");
  const start = formData.get("start");
  const end = formData.get("end");
  const timezone = formData.get("timezone");

  return { eventname, email, message, start, end, timezone };
}

function getTicketBody(start: string, end: string, message: string) {
  let ticketBody =
    "Vielen Dank für Deine Anfrage. Wir bestätigen dir zeitnah Deine Reservierung per E-Mail.\n\n" +
    "Deine Anfrage: " +
    dayjs(start).format("LLL") +
    " – " +
    dayjs(end).format("LLL");
  if (message) {
    ticketBody += "\n\nDeine Nachricht: " + message;
  }

  ticketBody +=
    "\n\nWenn Du Fragen zu Deine Anfrage hast, schreibe uns einfach eine E-Mail an hallo@meine-nische.de";

  ticketBody +=
    "\n\nSonja und Fabian Feitsch\nMeine Nische Würzburg\n\nDatenschutz:\nhttps://meine-nische.de/kontakt#datenschutz\nImpressum:\nhttps://meine-nische.de/kontakt#impressum";

  return ticketBody;
}
