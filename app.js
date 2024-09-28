const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();
const { v4: uuidv4 } = require("uuid");
let db = null;
const dbPath = path.join(__dirname, "event.db");
app.use(express.json());
app.use(cors());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log(`Server Running At http://localhost:3000`)
    );
  } catch (error) {
    console.log(`DB Error At ${error.message}`);
  }
};

//posting a event

app.post("/events", async (request, response) => {
  const { name, description, date } = request.body;
  const id = uuidv4();
  console.log(id);
  const insertQuery = `
  INSERT INTO events(id,name,description,date) VALUES(
      '${id}',
      '${name}',
      '${description}',
      '${date}'
  );`;
  await db.run(insertQuery);
  response.send("Add Successfully");
});

// GET All Events

app.get("/events", async (request, response) => {
  const eventsQuery = `
    SELECT
    *
    FROM
    events;`;
  const dbResponse = await db.all(eventsQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});

/// Register For An Event

app.post("/events/:id/register", async (request, response) => {
  try {
    const { id } = request.params;
    console.log(id);
    const registrationId = uuidv4();
    console.log(registrationId);
    const { name, email } = request.body;
    console.log(name, email);
    const registerQuery = `
  INSERT INTO registrations(id, event_id, user_name, user_email) VALUES(
      '${registrationId}',
      '${id}',
      '${name}',
      '${email}');`;
    await db.run(registerQuery);
    response.send("Successfully Register For Event");
  } catch (error) {
    response.send({ error: error.message });
  }
});

app.get("/events/:id/registrations", async (request, response) => {
  const { id } = request.params;
  const registrationsQuery = `
  SELECT
  *
  FROM
  registrations
  WHERE
  event_id = '${id}'`;
  const registrationArray = await db.all(registrationsQuery);
  response.send(registrationArray);
});

initializeDBAndServer();
