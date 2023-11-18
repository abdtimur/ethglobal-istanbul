


export async function sendPush(
  title: string,
  body: string,
  account: string,
): Promise<boolean> {
  const { WALLETCONNECT_PUSH_TOKEN } = process.env;
  const response = await fetch(
    'https://notify.walletconnect.com/69b67f11efec451f5be58fe541681209/notify',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WALLETCONNECT_PUSH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification: {
          type: '9dd89834-3dea-466a-b647-8de17ad59d3c',
          title: title,
          body: body,
        },
        accounts: [
          'eip155:1:' + account, // CAIP-10 account ID
        ],
      }),
    },
  );

  console.log(response);

  return response.ok;
}
