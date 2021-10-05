const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
   name: String
});


const myDB = mongoose.connection.useDb('writingDB');

const Task = myDB.model('Task', taskSchema);

module.exports = Task;
