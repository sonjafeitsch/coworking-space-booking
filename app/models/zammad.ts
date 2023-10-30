type User = {
  id: number;
  email: string;
};

export async function getUser(email: string): Promise<User> {
  let users = [];

  try {
    const result = await fetch(
      `${process.env.ZAMMAD_API_URL}/api/v1/users/search?query=${email}` ?? "",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Token token=${process.env.ZAMMAD_TOKEN}`,
        },
      }
    );
    users = await result.json();
  } catch (error) {
    console.error(error);
    throw new Response("Es kam zu einem API Fehler", { status: 500 });
  }

  if (users.length < 1) {
    throw new Response(
      "Dieser Nutzer existiert noch nicht in unserem System. Bitte schreibe uns eine Nachricht an hallo@meine-nische.de",
      { status: 400 }
    );
  }

  if (users.length > 1) {
    throw new Response(
      "Dieser User existiert zweimal. Bitte kontaktiere den Support.",
      { status: 400 }
    );
  }

  const user: User = {
    email: users[0].email,
    id: users[0].id,
  };

  return user;
}

export async function createTicket(
  email: string,
  eventname: string,
  message: string
): Promise<string> {
  let ticketNumber = "";

  try {
    const response = await fetch(
      `${process.env.ZAMMAD_API_URL}/api/v1/tickets` ?? "",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Token token=${process.env.ZAMMAD_TOKEN}`,
        },
        body: JSON.stringify({
          title: eventname,
          group: "Users",
          customer: email,
          article: {
            subject: eventname,
            body: message,
            type: "email",
            internal: false,
            to: email,
          },
        }),
      }
    );
    const data = await response.json();
    ticketNumber = data.number as string;
  } catch (error) {
    console.error(error);
    throw new Response("Es kam zu einem API-Fehler", { status: 500 });
  }

  return ticketNumber;
}
