const { db } = require("../firebaseAdmin");

const getCollection = (name) => db.collection(name);

const documentData = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
});

module.exports = {
  getCollection,
  documentData
};