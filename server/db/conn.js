const { MongoClient } = require("mongodb");

let db;

module.exports = {
  connectToServer: function () {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    client.connect().then(client => {
      db = client.db();
      console.log("Successfully connected to MongoDB.");
    }).catch(err => {
      if (err) {
        console.error(err);
        process.exit();
      }
      
    });
  },

  getDb: function () {
    return db;
  },
};