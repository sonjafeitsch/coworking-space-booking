import dayjs from "dayjs";
import { xml2json } from "xml-js";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import { v4 as uuidv4 } from "uuid";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale("de");

type Event = {
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
    throw new Error(errorMessage);
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
  if (dayjs(start).isAfter(end)) {
    throw new Error("Der Beginn darf nicht hinter dem Ende liegen.");
  }

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
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      return getEventsFromResponse(xml2json(data, { compact: true }));
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
}

export async function createEvent(title: string, start: string, end: string) {
  const events = await getEvents(
    dayjs(start).utc().format("YYYYMMDDTHHmmss"),
    dayjs(end).utc().format("YYYYMMDDTHHmmss")
  );
  if (events.length > 0) {
    throw new Error(
      "Event konnte nicht angelegt werden, da schon ein anderes Event existiert."
    );
  }

  const uuid = uuidv4();

  const xmlData = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VEVENT
UID:${uuid}
DTSTAMP:${dayjs().utc().format("YYYYMMDDTHHmmss")}
DTSTART;TZID=Europe/Berlin:${dayjs(start).format("YYYYMMDDTHHmmss")}
DTEND;TZID=Europe/Berlin:${dayjs(end).format("YYYYMMDDTHHmmss")}
SUMMARY:${title}
END:VEVENT
END:VCALENDAR
 `;

  const result = await fetch(process.env.CALENDAR_URL + `${uuid}.ics` ?? "", {
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
  })
    .then((response) => {
      console.log("Create event", response);
      return { message: "Event erstellt" };
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
}
