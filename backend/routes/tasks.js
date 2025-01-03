const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async (req, res) => {
    if (!req.oidc.user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = req.oidc.user.sub; // `auth0Id` of the user

    try {
        // Find the user by their `auth0Id`
        const user = await User.findOne({auth0Id: userId});
        if (!user) {
            return res.status(404).json({error: "User not found."});
        }

        // Return the user's tasks
        res.json(user.tasks);
    } catch (e) {
        console.error("Error fetching tasks:", e);
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.post("/", async (req, res) => {
    if (!req.oidc.user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = req.oidc.user.sub; // `auth0Id` of the user
    const newTask = req.body; // Task data from the request body

    // Validate the incoming task data
    if (!newTask.title || !newTask.description) {
        return res.status(400).json({error: 'Title and description are required.'});
    }

    try {
        // Find the user by their Auth0 ID
        const user = await User.findOne({auth0Id: userId});
        if (!user) {
            return res.status(404).json({error: 'User not found.'});
        }

        // Add the new task to the user's tasks array
        user.tasks.push({
            title: newTask.title,
            description: newTask.description,
            streakCount: newTask.streakCount || 0, // Default to 0 if not provided
            lastCompleted: newTask.lastCompleted || null,
            pending: false
        });

        // Save the updated user document
        await user.save();

        res.status(201).json({message: 'Task added successfully.', tasks: user.tasks});
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.patch('/', async (req, res) => {
    if (!req.oidc.user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = req.oidc.user.sub; // Auth0 ID of the user

    try {
        // Find the user by their Auth0 ID
        const user = await User.findOne({auth0Id: userId});

        if (!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        // Extract taskId from the request body
        const taskId = req.body._id;

        // Find the task by its _id
        const task = user.tasks.id(taskId);

        if (!task) {
            return res.status(404).json({message: 'Task not found.'});
        }

        // Update the task fields
        if (req.body.title != null) {
            task.title = req.body.title;
        }

        if (req.body.description != null) {
            task.description = req.body.description;
        }

        await user.save();
        res.json({message: 'Task updated successfully.', task});
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/:taskId', async (req, res) => {
    if (!req.oidc.user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = req.oidc.user.sub; // Auth0 ID of the user
    const taskId = req.params.taskId;

    try {
        // Find the user by their Auth0 ID
        const user = await User.findOne({auth0Id: userId});

        if (!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        // Find the task by its _id
        const task = user.tasks.id(taskId);

        res.json(task)
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});


router.delete('/:taskId', async (req, res) => {
    if (!req.oidc.user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = req.oidc.user.sub; // Auth0 ID of the user

    try {
        // Find the user by their Auth0 ID
        const user = await User.findOne({auth0Id: userId});

        if (!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        // Extract taskId from the request body
        const taskId = req.params.taskId;

        if (!taskId) {
            return res.status(400).json({message: 'Task _id is required.'});
        }

        // Find and remove the task by its _id
        const task = user.tasks.id(taskId);

        if (!task) {
            return res.status(404).json({message: 'Task not found.'});
        }

        user.tasks = user.tasks.filter((task) => task._id.toString() !== taskId);

        await user.save(); // Save the changes
        res.json({message: 'Task deleted successfully.'});
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

module.exports = router;

