const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const toDoRoutes = require('./routes/toDoRoutes');
const cron = require('node-cron');
const axios = require('axios');
const ToDo = require('./models/TodoList');
// const moment = require('moment');

require('dotenv').config({ path: '../.env' });

const PORT = process.env.PORT || 5000;

console.log('DB_URL:', process.env.DB_URL);
console.log('ONESIGNAL_APP_ID:', process.env.ONESIGNAL_APP_ID);
console.log('ONESIGNAL_REST_API_KEY:', process.env.ONESIGNAL_REST_API_KEY);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/todo', toDoRoutes);

let isDbConnected = false;

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("MongoDB Connected");
        isDbConnected = true;
    })
    .catch(err => {
        console.error("MongoDB Connection Error:", err.message);
        isDbConnected = false;
    });

cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const dueTasks = await ToDo.find({
            reminder: { $lte: new Date(now.getTime() + 60 * 1000) },
            isCompleted: false,
            notificationSent: false
        }).populate({
            path: 'createdBy',
            select: 'playerId email'
        });

        console.log(`Cron job running at ${now}`);
        console.log(`Due tasks found: ${dueTasks.length}`);

        for (const task of dueTasks) {
            const user = task.createdBy;

            if (!user) {
                console.log(`Task ${task._id} has no creator`);
                continue;
            }

            if (!user.playerId) {
                console.log(`No player ID for task "${task.title}" (User: ${user._id}, Email: ${user.email})`);
                continue;
            }

            try {
                const reminderTime = new Date(task.reminder);
                if (reminderTime < now) {
                    console.log(`Task "${task.title}" reminder is in the past (${reminderTime}). Sending immediately.`);
                    await axios.post(
                        'https://onesignal.com/api/v1/notifications',
                        {
                            app_id: process.env.ONESIGNAL_APP_ID,
                            include_player_ids: [user.playerId],
                            contents: { en: `Reminder: "${task.title}" was due at ${moment(reminderTime).format('YYYY MMM D, h:mm A')}!` },
                            headings: { en: "Task Reminder" },
                        },
                        {
                            headers: {
                                Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
                            },
                        }
                    );
                } else {
                    console.log(`Scheduling notification for task "${task.title}" at ${reminderTime}`);
                    await axios.post(
                        'https://onesignal.com/api/v1/notifications',
                        {
                            app_id: process.env.ONESIGNAL_APP_ID,
                            include_player_ids: [user.playerId],
                            contents: { en: `Reminder: "${task.title}" is due now!` },
                            headings: { en: "Task Reminder" },
                            send_after: reminderTime.toISOString()
                        },
                        {
                            headers: {
                                Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
                            },
                        }
                    );
                }
                task.notificationSent = true;
                await task.save();
                console.log(`Notification scheduled for task "${task.title}" at ${task.reminder}`);
            } catch (error) {
                console.error(`Notification scheduling failed for task "${task.title}":`, error.response?.data || error.message);
            }
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));