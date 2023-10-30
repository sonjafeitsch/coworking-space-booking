import dayjs from "dayjs";
import { xml2json } from "xml-js";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { v4 as uuidv4 } from "uuid";
import { Response } from "@remix-run/node";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale("de");

export type Event = {
  start: string;
  end: string;
  summary: string;
};

function getValue(rawData: string, key: string) {
  const data = rawData.split("\n");
  const rawValue = data.filter((item) =>
    item.toLowerCase().includes(key.toLowerCase())
  );
  if (rawValue.length < 1) {
    return "not found";
  }
  const value = rawValue[0].split(":")[1];
  return value;
}

function getEventsFromResponse(rawData: string) {
  let events: Event[] = [];
  const jsonRawData = JSON.parse(rawData);

  if (jsonRawData["d:error"]) {
    const errorMessage = jsonRawData["d:error"]["s:message"]["_text"];
    throw new Response(errorMessage, { status: 500 });
  }

  const response = jsonRawData["d:multistatus"]["d:response"];
  if (!response) {
    return events;
  }
  events = !Array.isArray(response)
    ? [
        {
          start: getValue(
            response["d:propstat"]["d:prop"]["cal:calendar-data"]["_text"],
            "DTSTART;TZID=Europe/Berlin"
          ),
          end: getValue(
            response["d:propstat"]["d:prop"]["cal:calendar-data"]["_text"],
            "DTEND;TZID=Europe/Berlin"
          ),
          summary: getValue(
            response["d:propstat"]["d:prop"]["cal:calendar-data"]["_text"],
            "SUMMARY"
          ),
        },
      ]
    : response.map((rawEvent: any) => {
        const calendarEvent =
          rawEvent["d:propstat"]["d:prop"]["cal:calendar-data"]["_text"];
        return {
          start: getValue(calendarEvent, "DTSTART;TZID=Europe/Berlin"),
          end: getValue(calendarEvent, "DTEND;TZID=Europe/Berlin"),
          summary: getValue(calendarEvent, "SUMMARY"),
        };
      });

  return events;
}

export async function getEvents(start: string, end: string) {
  const xmlData = `<?xml version="1.0" encoding="utf-8" ?>
    <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
      <D:prop>
        <D:getetag />
        <C:calendar-data />
      </D:prop>
      <C:filter>
        <C:comp-filter name="VCALENDAR">
          <C:comp-filter name="VEVENT">
            <C:time-range start="${start}" end="${end}"/>
          </C:comp-filter>
        </C:comp-filter>
      </C:filter>
    </C:calendar-query>`;

  let events: Event[] = [];

  try {
    const result = await fetch(process.env.CALENDAR_URL ?? "", {
      method: "REPORT",
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        Depth: "1",
        Authorization:
          "Basic " +
          btoa(
            `${process.env.CALENDAR_USERNAME}:${process.env.CALENDAR_PASSWORD}`
          ),
      },
      body: xmlData,
    });
    const rawData = await result.text();
    events = getEventsFromResponse(xml2json(rawData, { compact: true }));
  } catch (error) {
    console.error(error);
    throw new Response("Es kam zu einem API-Fehler", { status: 500 });
  }

  return events;
}

export async function createEvent(
  title: string,
  start: string,
  end: string,
  timezone: string,
  ticketNumber: string
) {
  const parsedTimezone = parseInt(timezone);
  let events: Event[] = [];

  try {
    events = await getEvents(
      dayjs(start).utcOffset(parsedTimezone).format("YYYYMMDDTHHmmss"),
      dayjs(end).utcOffset(parsedTimezone).format("YYYYMMDDTHHmmss")
    );
  } catch (error) {
    console.error(error);
    throw new Response("Es kam zu einem API-Fehler", { status: 500 });
  }

  if (events.length > 0) {
    throw new Response(
      "Event konnte nicht angelegt werden, da schon ein anderes Event existiert.",
      { status: 400 }
    );
  }

  const uuid = uuidv4();
  const xmlData = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VEVENT
UID:${uuid}
DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}
DTSTART;TZID=Europe/Berlin:${dayjs(start).format("YYYYMMDDTHHmmss")}
DTEND;TZID=Europe/Berlin:${dayjs(end).format("YYYYMMDDTHHmmss")}
SUMMARY:${"BLOCKER #" + ticketNumber + ": " + title}
END:VEVENT
END:VCALENDAR
 `;

  try {
    await fetch(process.env.CALENDAR_URL + `${uuid}.ics` ?? "", {
      method: "PUT",
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        Expect: "",
        Authorization:
          "Basic " +
          btoa(
            `${process.env.CALENDAR_USERNAME}:${process.env.CALENDAR_PASSWORD}`
          ),
      },
      body: xmlData,
    });
  } catch (error) {
    console.error(error);
    throw new Response("Es kam zu einem API-Fehler", { status: 500 });
  }
}
