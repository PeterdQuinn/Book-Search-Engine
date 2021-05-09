const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { remove } = require('../models/Book');

const resolvers = {
  Query: {
    me: async (parent,args,context) => {
      const userData = User.findOne( { _id: context.user._id}).select("-__v-password");
      return userData 
    }
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('That user does not exist');
      }
    
      if (password !== user.password) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
        const user = await User.create(args)
        const token = signToken(user)
       return{token, user}; 
    },
    saveBook: async (parent, {bookData}, context) => {
        if (context.user) {
            const update = await User.findOneAndUpdate(
                {_id:context.user._id},
                {$pull: {savedBooks: bookData}},
                {new:true}  
            )
            return update 
        }
        throw new AuthenticationError("you gotta log in dog!")
    },

    removeBook: async (parent, args, context) => {
      if(context.user) {
      const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
      );

      return updatedUser;
      }

      throw new AuthenticationError('You gotta log in dog!');
  }
}
};

    





module.exports = resolvers;
