import fs from "fs/promises";
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'secret',
    port: 5432,
});

const readEventsPoolFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        if (!data) {
            throw new Error("Error while reading events pool file");

        }
        const events = JSON.parse(data);
        
        return events;
    } catch (err) {
        console.error('Error in readEventsPoolFile', err);
    }
};

const calculateRevenue = (user_revnue, event_revenue, operation_type) => {
    switch (operation_type) {
        case 'add_revenue':
            return user_revnue += event_revenue;
        case 'subtract_revenue':
            return user_revnue -= event_revenue;
        default:
            throw new Error('operation type does not supported');
    }
}
const calculateUsersRevenue = (events) => {
    const map = {};
    events.forEach(event => {
        map[event.userId] = map[event.userId] || 0;
        map[event.userId] = calculateRevenue(map[event.userId], event.value, event.name);
    });
    return map;
}

async function runQueryWithLock(user_id, revenue) {

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const get_query = `
            SELECT user_id, revenue
            FROM users_revenue
            WHERE user_id = $1
            FOR UPDATE ;`;

        const { rows } = await client.query(get_query, [user_id]);
        let user_data;

        if (rows.length > 0) {
            user_data = rows[0];
            user_data.revenue = Number(user_data.revenue) + revenue;
        }else{
            user_data = {user_id,revenue}
        }

        const upsert_query = `
            INSERT INTO users_revenue (user_id, revenue)
            VALUES ($1, $2)
            ON CONFLICT (user_id)
            DO UPDATE SET revenue = $2;`;

        await client.query(upsert_query, [user_id, user_data.revenue]);

        await client.query('COMMIT');
        console.log('UPSERT operation with lock completed.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error executing UPSERT with lock:', error);
        throw error;
    } finally {
        client.release();
    }
}

const upsertUsersRevenue = (users_revenue_mapping) => {
    for (const [user_id, revenue] of Object.entries(users_revenue_mapping)) {
        runQueryWithLock(user_id, revenue);
    }

}

const events = await readEventsPoolFile('events_pool.json');
const users_revenue_mapping = calculateUsersRevenue(events);
upsertUsersRevenue(users_revenue_mapping);
