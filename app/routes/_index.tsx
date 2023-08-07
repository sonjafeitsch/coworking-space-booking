import { json, LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { getEvents } from "~/models/events";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/de";
import image from "../../public/assets/images/nische_ganz_800w.png";

dayjs.extend(localizedFormat);
dayjs.locale("de");

export const meta: V2_MetaFunction = () => {
  return [{ title: "Meine Nische – Buchung" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  console.log(start, end);
  if (!start || !end) {
    return json({ events: [] });
  }
  const events = await getEvents(start, end);
  console.log(events);
  return json({ events });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const { state } = useNavigation();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h2 className="text-4xl font-extrabold">Meine Buchung</h2>
      <Form className="flex flex-col items-start gap-2 mt-4">
        <div>
          <label
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="start"
          >
            Von
          </label>
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            id="start"
            name="start"
            type="datetime-local"
            defaultValue={start}
          />
        </div>
        <div>
          <label
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="end"
          >
            Bis
          </label>
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            id="end"
            name="end"
            type="datetime-local"
            defaultValue={end}
          />
        </div>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
          type="submit"
        >
          {state === "loading"
            ? "Events werden gesucht…"
            : "Verfügbarkeit prüfen"}
        </button>
      </Form>
          {data.events.length > 0 ? (
            <>
              <div className="font-semibold">
                Leider belegt. Folgende parallele Veranstaltungen wurden
                gefunden:
              </div>
              <ul>
                {data.events.map((event, i) => (
                  <li key={i}>
                    {dayjs(event.start).format("LLL")} –{" "}
                    {dayjs(event.end).format("LT")}: {event.summary}
                  </li>
                ))}
              </ul>
            </>
          ) : start && end ? (
            <div className="font-semibold">Juhu, die Nische ist frei!</div>
          ) : (
            <></>
          )}
        </div>
    </div>
  );
}
