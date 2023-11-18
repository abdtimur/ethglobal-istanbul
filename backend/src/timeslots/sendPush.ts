export async function sendPush(title: string, body: string, account: string): Promise<boolean> {
  const response = await fetch(
    'https://notify.walletconnect.com/69b67f11efec451f5be58fe541681209/notify',
    {
      method: "POST",
      headers: {
        Authorization: 'Bearer <NOTIFY_API_SECRET>'
      },
      body: JSON.stringify({
        notification: {
          type: "a1e53b95-18e5-4af8-9f03-9308ec87b687",
          title: title,
          body: body,
        },
        accounts: [
          "eip155:1:" + account // CAIP-10 account ID
        ]
      })
    }
  );

  console.log(response);

  return response.ok;

}
