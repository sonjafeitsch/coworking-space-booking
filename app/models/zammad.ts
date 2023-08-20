type User = {
  id: number;
  email: string;
};

export async function getUser(email: string): Promise<User[]> {
  const result = await fetch(
    `${process.env.ZAMMAD_API_URL}/api/v1/users/search?query=${email}` ?? "",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Token token=${process.env.ZAMMAD_TOKEN}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length < 1) {
        return [];
      }
      if (data.length > 1) {
        throw new Error(
          "Dieser User existiert zweimal. Bitte kontaktiere den Support."
        );
      }
      return data.map((user: any) => {
        return {
          email: user.email,
          id: user.id,
        } as User;
      });
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
}

export async function createTicket(
  email: string,
  eventname: string,
  message: string
) {
  await fetch(`${process.env.ZAMMAD_API_URL}/api/v1/tickets` ?? "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Token token=${process.env.ZAMMAD_TOKEN}`,
    },
    body: JSON.stringify({
      title: "Test: " + eventname,
      group: "Users",
      customer: email,
      article: {
        subject: "Test: " + eventname,
        body: message,
        type: "email",
        internal: false,
        to: email,
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => {
      throw new Error(error);
    });
}
