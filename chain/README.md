# MindShare Chain module

Main contract Maindshare is responsible for the following: 
- creating new mentors 
- initiating NFT collections for the attested mentors 
- managing the attestation process
- managing validators, their roles and their rewards

Other contracts are: 
- MentorsTime: collection of mentor's booked slots which also handles an escrow and a refund process
Each NFT first created with mentor as an owner and a call value put into escrow. 
When a mentee books a slot, the call value is transferred to the mentor. And NFT is transfered for the person who booked the slot.
- BaseMindVerificator: base contract for all verificators. It contains a list of all verificators and a function to add new verificators.
- OptimisticOracleMeetingFinished: Optimistic oracle for the meeting finished event, it handles the assertion process and the dispute process.
- MeetingDurationFunction: Chainlink function to decentralize and trustify solution on meeting status and duration. Currently used with the backend enpoint
- IAttester: interface for the Attester contract. Attester leverages EAS to attest the identity of the mentors. Attested mentors could be listed on the mentors list and could be booked by mentees.

Test & Deploy:
- Full Golden path flow is described in the test, which allow to book and complete the slot (receive an NFT by mentee) and receive a reward by the mentor.
- scripts folder contains scripts to deploy contracts to the testnets 

**_ CHAINS _**

**Sepolia**
- Attester: `0xBc952B41B7cf1CD5c912EE7CC7264CAb9a314B5d`
- MindShare: `0xeb1984603713C6df4E391738C89371bfCa860797`
- WorldIDVerificator: `0x914aF56e7bE74d6b51b438c90090B20c90FA7fBA`
- TLSNVerificator: `0x5A36AA738be4573223d7E95D5ee079E9964187c3`
- PolygonIdVerificator: `0x7FBdF00baC751F27F9F255450f691e660fa89A89`

**Mumbai**
- Attester: `0x738f81d5391F71E0345c0b63D592995F5ed82CF5`
- MindShare: `0x5B2FE8A69573321e858C0601e5443B36f4F0f1D7`
- WorldIDVerificator: `0xAbeadA01FDE4cb69B62d10636f124950Bcdf81D8`
- TLSNVerificator: `0x5a918c9961Db19Ea98Bb30EDD4e34A047db2d9e7`
- PolygonIdVerificator: `0xA60848154B771b125207527E94FeF3cc2D1666c7`

**Scroll**
- Attester: `0xf05F463945Be654113BE74Fa39A4D5D9606DC586`
- MindShare: `0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38`
- WorldIDVerificator: `0x7525eD8c9fEC2556353B495ce0320A91efef42F8`
- TLSNVerificator: `0x5Bf62bEd8fcEe466060C3C294C05A91e57f9F5Ca`
- PolygonIdVerificator: `0x60a92f1a6FB111cB18599965971763CA9189109a`

**BaseGoerli**
- Attester: `0x1801A7c6EC5a5dA1f1e34bb40612639bda763B9a`
- MindShare: `0x52B1279634F08F4a9c2F79bf355F48952d9D711F`
- WorldIDVerificator: `0xc3E29Ee6429a08A907A29a445A36f14C5Fd71D82`
- TLSNVerificator: `0x3047E46d68c8507F35c81131f4Db5aCfae396E1d`
- PolygonIdVerificator: `0xE58aC423A95dffB513E9b6367f7F38a1f50CB231`

**zkEvmTestnet**
- Attester: `0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38`
- MindShare: `0xEEF90A540E05c6531E2247B1b8a04faf7c1183aB`
- WorldIDVerificator: `0xc60022B6C71eB3e52DEbdBDd9F5f7798e5f26Dae`
- TLSNVerificator: `0x722F7a61d1a58d22bcEA95184a4FAadEe955F689`
- PolygonIdVerificator: `0xb75b977a5A45D703542316D8f66177010c085662`

**GnosisChiado**
Tweet (Xeet) with @gnosischain mention: https://twitter.com/lolchto_eth/status/1726082783632818676 ❤️ ❤️ ❤️ 
- Attester: `0xf05F463945Be654113BE74Fa39A4D5D9606DC586`
- MindShare: `0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38`
- WorldIDVerificator: `0xEEF90A540E05c6531E2247B1b8a04faf7c1183aB`
- TLSNVerificator: `0xc60022B6C71eB3e52DEbdBDd9F5f7798e5f26Dae`
- PolygonIdVerificator: `0x722F7a61d1a58d22bcEA95184a4FAadEe955F689`