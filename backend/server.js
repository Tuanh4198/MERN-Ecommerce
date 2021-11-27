const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// handling uncaught exceptions
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	process.exit(1);
})

// config
dotenv.config({path:"backend/config/config.env"})

// connecting to database
connectDatabase()

app.listen(process.env.PORT, () => {
	console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

// unhandled promise rejection
process.on("unhandledRejection", err => {
	console.log(`Error: ${err.message}`);
	server.close(() => {
		process.exit(1);
	});
})
