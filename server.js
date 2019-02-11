const { ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import typeDefs and resolvers from files
const filePath = path.join(__dirname, 'typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
const resolvers = require("./resolvers");

// Import environment variables and Mongoose Models
require('dotenv').config({ path: 'variables.env' });
const User = require('./models/User');
const Post = require('./models/Post');

// Connect to MLab Database
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true }
).then(() => {

  console.log('mongoDB Connected')

}).catch(err => console.error(err));

//verifying JSON web token
const getUser = async token => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
      // console.log('user', user);

    } catch (err) {
      throw new AuthenticationError('Your session has ended. Please sign in again!');

    }
  }
}


// Create GraphQL Server (w/Apollo Server) 
// Using typeDefs, resolvers, and context
const server = new ApolloServer({
  context: async ({ req }) => {
    //console.log(req.headers['authorization']);
    const token = req.headers['authorization'];
    return { User, Post, currentUser: await getUser(token) }
  },
  typeDefs,
  resolvers,
  formatError: error => ({
    name: error.name, message: error.message.replace('Context creation failed:', "")
  })
});

server.listen(4600).then(({ url }) => {
  console.log(`Server Listening on ${url}`)
});

