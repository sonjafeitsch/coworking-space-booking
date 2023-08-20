import { redirect, type ActionArgs, json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Button, TextArea, TextField } from "~/components";
import { createEvent } from "~/models/events";
import { createTicket, getUser } from "~/models/zammad";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const eventname = formData.get("eventname");
  const email = formData.get("email");
  const message = formData.get("message");
  const start = formData.get("start");
  const end = formData.get("end");

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

  let ticketBody =
    "Buchung für " +
    dayjs(start).format("LLL") +
    " – " +
    dayjs(end).format("LLL");
  if (message) {
    ticketBody += "\n-------------\n" + message;
  }

  const user = await getUser(email);
  if (user.length > 0) {
    Promise.all([
      await createEvent(eventname, start, end),
      await createTicket(user[0].email, eventname, ticketBody),
    ]);
  } else {
    throw new Error(
      "Dieser Nutzer existiert noch nicht in unserem System. Bitte schreibe uns eine Nachricht an hallo@meine-nische.de"
    );
  }

  return redirect("/finished");
};

export default function Submit() {
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const event = params.get("eventname") ?? "";

  return (
    <div className="flex flex-col justify-start w-1/2 gap-8">
      <div className="lg:max-w-lg">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
          Reservierung bestätigen
        </h1>
        <p className="mt-6 text-base leading-6 text-themed-base-text">
          Trage den Namen deiner Veranstaltung ein und hinterlasse optional eine
          Nachricht an uns. Wichtig: diese Reservierung ist noch keine finale
          Buchung. Wir bestätigen dir zeitnah deine Reservierung per E-Mail.
        </p>
      </div>
      <Form className="flex flex-col items-start gap-4" method="post">
        <input className="hidden" name="start" defaultValue={start} />
        <input className="hidden" name="end" defaultValue={end} />
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
        <Button type="submit">Reservieren</Button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col justify-start w-1/2 gap-2 text-red-500">
      <span className="font-semibold">Es ist ein Fehler aufgetreten: </span>
      {errorMessage}
    </div>
  );
}
