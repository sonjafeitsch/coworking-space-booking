import { json, LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { getEvents } from "~/models/events";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Meine Nische – Buchung" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  if (!start || !end) {
    return json({ events: [] });
  }
  const events = await getEvents(start, end);
  return json({ events });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const { state } = useNavigation();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Meine Buchung</h1>
      <Form>
        <label htmlFor="start">Von</label>
        <input
          id="start"
          name="start"
          type="datetime-local"
          defaultValue={params.get("start") ?? ""}
        />
        <label htmlFor="end">Bis</label>
        <input
          id="end"
          name="end"
          type="datetime-local"
          defaultValue={params.get("end") ?? ""}
        />
        <button type="submit">
          {state === "loading"
            ? "Events werden gesucht…"
            : "Verfügbarkeit prüfen"}
        </button>
      </Form>
      {data.events.length > 0 && (
        <div>{data.events.length} Events gefunden</div>
      )}
    </div>
  );
}
