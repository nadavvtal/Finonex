import fs from 'fs/promises';
import axios from "axios";


const readEventsFile = async (events_file_path) => {
  try {

    const events = await fs.readFile(events_file_path, 'utf8');
    if (!events) {
      throw new Error("Error while reading events file")
    }

    return JSON.parse(events);
  }
  catch (err) {
    console.log(err);
  }
}

const sendEventsToServer = (events_arr) => {
  events_arr.forEach(async (event) => {
    try {
      await makeRequest(event);
    }
    catch (err) {
      console.error("Error in sendEventsToServer ", err);
    }
  });
}

const makeRequest = async (event) => {
  const headers = {
    Authorization: `secret`,
    'Content-Type': 'application/json',
  };

  const requestOptions = {
    url: "http://localhost:8000/liveEvent",
    method: 'POST',
    headers,
    data: event,
  };

  try {
    const response = await axios(requestOptions);
    return response.data;
  } catch (error) {
    console.error('Error sending HTTP request:', error.message);
    throw error;
  }
}


const events_arr = await readEventsFile('events.json');
sendEventsToServer(events_arr);