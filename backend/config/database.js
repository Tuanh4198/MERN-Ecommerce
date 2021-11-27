const mongoose = require('mongoose');

const connectDatabase = () => {
	mongoose.connect(process.env.DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useCreateIndex: true,
		// useFindAndModify: false
	})
	.then((data) => {
		console.log(`MongoDB connected with server ${data.connection.host}`)
	})
	.catch((error) => {
		console.log(error)
	});
}

module.exports = connectDatabase;