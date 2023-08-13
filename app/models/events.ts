import { xml2json } from "xml-js";

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
      return getEventsFromResponse(xml2json(data, { compact: true }));
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
}
