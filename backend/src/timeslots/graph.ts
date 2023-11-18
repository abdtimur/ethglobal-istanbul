import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL =
  'https://api.studio.thegraph.com/query/39401/mindshare/version/latest';

const eventsQuery = `
  query {
    ownershipTransferreds {
        id,
        newOwner,
        transactionHash,
        blockNumber,
        blockTimestamp
      }
  }
`;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql(eventsQuery),
  })
  .then((data) => console.log('Subgraph data: ', data))
  .catch((err) => {
    console.log('Error fetching data: ', err);
  });
