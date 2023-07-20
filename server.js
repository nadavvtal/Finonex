import fs from "fs";
import pkg from 'pg';
import express from 'express';
const { Client } = pkg;
const app = express();
app.use(express.json());
const port = 8000;



app.post('/liveEvent', verifyAuth, validateBody, async (req, res) => {
    try {
        const event = req.body;
        appendEventToJsonFileSync(event);

        res.status(201).json({ message: 'Event sent to process' });
    } catch (err) {
        console.log(err);
        res
            .status(400)
            .json({ message: `Add event proccess failed` });
    }
});

app.get('/liveEvent/:userid', async (req, res) => {
    try {
        const user_id = req.params && req.params.userid;
        const result = await getRevenueByUserId(user_id);
        if (!result) {
            throw new Error('RESULTS NOT EXISTS');
        }
        res.send(result);
    } catch (err) {
        res.status(400).json({
            message: `Unable to get data`,
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function appendEventToJsonFileSync(objectToAppend) {
    try {
        let jsonData = [];
        const events_pool_file_path = "events_pool.json"
        if (fs.existsSync(events_pool_file_path)) {
            const data = fs.readFileSync(events_pool_file_path, 'utf8');

            try {
                jsonData = JSON.parse(data);
                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid JSON data in the file.');
                }
            } catch (error) {
                console.error('Error parsing JSON data:', error.message);
                throw error;
            }
        }

        jsonData.push(objectToAppend);

        fs.writeFileSync(events_pool_file_path, JSON.stringify(jsonData, null, 2), 'utf8');

        console.log('Object appended to the JSON file.');
    } catch (error) {
        console.error('Error appending object to JSON file:', error);
        throw error;
    }
}

async function getRevenueByUserId(user_id) {
    const connectionString =
        'postgresql://postgres:secret@localhost:5432/postgres';
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        const selectQuery = `
          SELECT user_id, revenue
          FROM users_revenue
          WHERE user_id = $1;`;

        const { rows } = await client.query(selectQuery, [user_id]);
        if (!rows) {
            throw new Error('Error while getting user data');
        }
        return rows[0];
    } catch (err) {
        throw new Error(err);
    } finally {
        await client.end();
    }
}

function verifyAuth(req, res, next) {
    try {

        const { authorization } = req.headers;
        if (!authorization || authorization != "secret") {
            throw new Error(errorMessage);
        }
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized request" });
    }
}

function validateBody(req, res, next) {
    try {

        const { body } = req;
        if (!body.userId || !body.name || !body.value) {
            throw new Error("Missing required fields");
        }
        next();
    } catch (err) {
        res.status(401).json({ message: err });
    }
}





