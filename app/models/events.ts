import { createDAVClient } from "tsdav";

export async function getEvents(start: string, end: string) {
  console.log(start, end);
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
  return events;
}
