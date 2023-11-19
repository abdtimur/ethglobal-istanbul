# MindShare Backend module

Mainly responsible for the data storage and slots logic implementation.
Interesting features to mention: 

- WalletConnect Web3Inbox library was used to notify all the actors about upcoming events and available slots
- The backend is using TheGraph to index the data and provide a GraphQL API
- zoom API was used to create and manage zoom meetings

Backend leverages multichain approach to provide actual information on account status based on the currently used chainId. 
Please see supported chains and addresses in the Chain Module

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```
