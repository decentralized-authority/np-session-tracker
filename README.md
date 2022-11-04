# Node Pilot Session Tracker
Keeps track of when POKT nodes hosted on Node Pilot are in a session.

## Required Environment Variables
* `NP_API_ENDPOINT` - Node Pilot JSON RPC server endpoint e.g. `10.0.0.2:34417`
* `POCKET_ENDPOINT` - Pocket endpoint for checking block height e.g. `https://mainnet.gateway.pokt.network/v1/lb/123456789`

## Build from source

### Install dependencies
```
npm install
```

### Build
```
npm run build
```

### Run
```
npm start
```

## Docker Usage

### Sample run script
```
docker run --rm -ti --name np-session-tracker \
--env POCKET_ENDPOINT=https://mainnet.gateway.pokt.network/v1/lb/123456789 \
--env NP_API_ENDPOINT=http://10.0.0.2:34417 \
-v /home/myuser/np-session-tracker-log:/np-session-tracker/log \
-p 34418:34418/tcp \
decentralizedauthority/np-session-tracker:0.1.2
```

## Check Node's status
```
curl http://localhost:34418/node/pokt-000
```
