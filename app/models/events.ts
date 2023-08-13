import { createDAVClient } from "tsdav";
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

// export async function getEvents(start: string, end: string) {
//   const client = await createDAVClient({
//     serverUrl: process.env.CALENDAR_URL ?? "",
//     credentials: {
//       username: process.env.CALENDAR_USERNAME,
//       password: process.env.CALENDAR_PASSWORD,
//     },
//     authMethod: "Basic",
//     defaultAccountType: "caldav",
//   });

//   const calendars = await client.fetchCalendars();
//   const events = await client.fetchCalendarObjects({
//     calendar: calendars[1],
//     timeRange: {
//       start: start + "+02:00",
//       end: end + "+02:00",
//     },
//   });
//   const formattedEvents: Event[] = events.map((event) => {
//     return {
//       start: getValue(event.data, "DTSTART;TZID=Europe/Berlin"),
//       end: getValue(event.data, "DTEND;TZID=Europe/Berlin"),
//       summary: getValue(event.data, "SUMMARY"),
//     };
//   });
//   return formattedEvents;
// }

export async function getEvents(start: string, end: string) {
  console.log(start, end);
  const USERNAME = "briefe@sonja-feitsch.de";
  const PASSWORD = "FeEpE7rgZMlnrtCCNnetFlI7bW0O8";
  const CALENDAR_URL =
    "https://fafeitsch.de/baikal/html/dav.php/calendars/briefe@sonja-feitsch.de/development";

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

  await fetch(CALENDAR_URL, {
    method: "REPORT",
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      Depth: "1",
      Authorization: "Basic " + btoa(`${USERNAME}:${PASSWORD}`),
    },
    body: xmlData,
  })
    .then((response) => response.text())
    .then((data) => {
      // const json = JSON.parse(xml2json(data, { compact: true }));
      // console.log(
      //   "json",
      //   json["d:multistatus"]["d:response"]["d:propstat"]["d:prop"][
      //     "cal:calendar-data"
      //   ]["_text"]
      // );
      console.log(xml2json(data, { compact: true }));
    })
    .catch((error) => {
      console.log("error", error);
    });

  return {};
}
