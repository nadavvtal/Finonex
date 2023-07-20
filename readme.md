
> Finonex Assignment  

## Description

This project contains 3 node applications.
1. server :
  a. Serve POST request which contains events and write them to events file.
  b. Serve GET request to get users revenue data from DB.

2. client: 
  client read events from events.json file and send them one by one to the server.

3. data processor: 
  reads event from event_pool file and procces each event => update and calculate users revenue and save to DB.


## Setup queue

-This apps using PostgreSQL as DB service. for initialize PostgreSQL docker container run the commend :

```sh
docker run -d -p 5432:5432 --name my-postgres -e POSTGRES_PASSWORD=secret postgres

```

## Install

```sh
npm install
```


## Run Server

```sh
node server.js
```

## Run client

```sh
node client.js
```

## Run data processor

```sh
node data_processor.js
```


## Author

 **Nadav tal**

