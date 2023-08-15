import { redirect, type ActionArgs, json } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, TextField } from "~/components";
import { createEvent } from "~/models/events";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const eventname = formData.get("eventname");
  const start = formData.get("start");
  const end = formData.get("end");

  const errors = {
    title: eventname ? null : "Bitte gib den Titel deiner Veranstaltung ein.",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof eventname === "string", "Der Titel muss ein Text sein.");
  invariant(typeof start === "string", "Startdatum muss ein Text sein.");
  invariant(typeof end === "string", "Enddatum muss ein Text sein.");

  await createEvent(eventname, start, end);

  return redirect("/finished");
};

export default function Submit() {
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const event = params.get("eventname") ?? "";

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col justify-start w-1/2 gap-8">
        <div className="lg:max-w-lg">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-themed-text font-serif sm:text-4xl">
            Buchung bestätigen
          </h1>
        </div>
        <Form className="flex flex-col items-start gap-4" method="post">
          <input className="hidden" name="start" defaultValue={start} />
          <input className="hidden" name="end" defaultValue={end} />
          <TextField
            className="w-full"
            label="Name der Veranstaltung"
            id="eventname"
            name="eventname"
            defaultValue={event}
          />
          <TextField
            className="w-full"
            label="E-Mail"
            id="email"
            name="email"
          />
          <TextField
            className="w-full"
            label="Nachricht"
            id="message"
            name="message"
          />
          <Button type="submit">Buchen</Button>
        </Form>
      </div>
    </div>
  );
}
