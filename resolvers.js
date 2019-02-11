const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const createToken = (user, secret, expiresIn) => {
  const { username, email } = user
  return jwt.sign({ username, email }, secret, { expiresIn });
}



module.exports = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Custom Scalar Date Type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    }
  }),
  Query: {
    searchPosts: async (_, { searchTerm }, { Post }) => {
      if (searchTerm) {
        const searchResults = await Post.find(
          // search with text using searchTerm with find method
          { $text: { $search: searchTerm } },
          // assign each result a "text score" to provide best match(es)
          { score: { $meta: 'textScore' } }
          // sort results according to textScore (as well as Likes in this instance)
        ).sort({
          score: { $meta: 'textScore' },
          // likes in descending order
          likes: 'desc'
        }).limit(5);

        return searchResults;
      }
    },
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
        path: 'createdBy',
        model: 'User'
      });
      return posts;
    },
    getPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOne({ _id: postId }).populate({
        path: "messages.messageUser",
        model: "User"
      });
      return post;
    },
    getUserPosts: async (_, { userId }, { Post }) => {
      const posts = await Post.find({
        createdBy: userId
      });
      return posts;
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let posts;
      if (pageNum === 1) {
        posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).limit(pageSize);
      } else {
        // if page number is greater than one, need to provide
        // logic for how many documents to skip
        const skips = pageSize * (pageNum - 1);
        posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).skip(skips).limit(pageSize);
      }
      const totalDocs = await Post.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    },
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }

      const user = await User.findOne({ username: currentUser.username }).populate({
        path: 'favorites',
        model: 'Post'
      });
      return user;
    }
  },
  Mutation: {
    likePost: async (_, { postId, username }, { Post, User }) => {
      // find the post, and one to the likes value
      const post = await Post.findOneAndUpdate(
        // filter by id
        { _id: postId },
        //increment likes field
        { $inc: { likes: 1 } },
        // return updated value
        { new: true }
      );
      // find user and add id of post to favorites array
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      });
      // return ony likes from post and favorites from user
      return { likes: post.likes, favorites: user.favorites }
    },
    unlikePost: async (_, { postId, username }, { Post, User }) => {
      // find the post, and one to the likes value
      const post = await Post.findOneAndUpdate(
        // filter by id
        { _id: postId },
        //increment likes field (subtract)
        { $inc: { likes: -1 } },
        // return updated value
        { new: true }
      );
      // find user and remove id of post to favorites array
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      });
      // return ony likes from post and favorites from user
      return { likes: post.likes, favorites: user.favorites }
    },
    addPost: async (_, { title, imageUrl, categories, description, creatorId }, { Post }) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();
      return newPost
    },
    deleteUserPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOneAndRemove({ _id: postId });
      return post;
    },
    updateUserPost: async (_, { postId, userId, title, imageUrl, categories, description }, { Post }) => {
      const post = await Post.findOneAndUpdate(
        // make sure correct post and correct user (author)
        { _id: postId, createdBy: userId },
        {
          $set: {
            title,
            imageUrl,
            categories,
            description
          }
        },
        { new: true }
      )
      return post;
    },
    addPostMessage: async (_, { messageBody, userId, postId }, { Post }) => {
      const newMessage = {
        messageBody,
        messageUser: userId,
      };

      const post = await Post.findOneAndUpdate(
        //first find post by id
        { _id: postId },
        //add new message to messages array (prepend)
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        // return fresh document after update
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return post.messages[0];
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid Password');
      }
      return { token: createToken(user, process.env.SECRET, '1hr') };

    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error('User already Exists');
      }

      const newUser = await new User({
        username,
        email,
        password
      }).save();

      return { token: createToken(newUser, process.env.SECRET, '1hr') };
    }
  }
}