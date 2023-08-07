import { createDAVClient } from "tsdav";

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

export async function getEvents(start: string, end: string) {
  const client = await createDAVClient({
    serverUrl: process.env.CALENDAR_URL ?? "",
    credentials: {
      username: process.env.CALENDAR_USERNAME,
      password: process.env.CALENDAR_PASSWORD,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  const calendars = await client.fetchCalendars();
  const events = await client.fetchCalendarObjects({
    calendar: calendars[1],
    timeRange: {
      start: start + "+02:00",
      end: end + "+02:00",
    },
  });
  const formattedEvents: Event[] = events.map((event) => {
    return {
      start: getValue(event.data, "DTSTART;TZID=Europe/Berlin"),
      end: getValue(event.data, "DTEND;TZID=Europe/Berlin"),
      summary: getValue(event.data, "SUMMARY"),
    };
  });
  return formattedEvents;
}
