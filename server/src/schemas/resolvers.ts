import { User } from "../models/index.js";
import { signToken, AuthenticationError } from "../services/auth.js";

interface Book {
  bookId: String;
  authors: String[];
  description: String;
  title: String;
  image: String;
  link: String;
}
interface User {
  _id: String;
  username: String;
  email: String;
  password: String;
  bookCount: Number;
  savedBooks: [Book];
}

interface AddUserArgs {
  userInput: {
    email: String;
    username: String;
    password: String;
    savedBooks: [Book];
  };
}
interface AddBookArgs {
  bookInput: {
    authors: String[];
    description: String;
    title: String;
    bookId: String;
    image: String;
    link: String;
  };
}
interface RemoveBookArgs {
  bookId: String;
}

interface Context {
  user?: User;
}

const resolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ): Promise<User | null> => {
      console.log(context.user); // debugging
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    // add a new user
    addUser: async (_parent: unknown, { userInput }: AddUserArgs) => {
      const user = await User.create({ ...userInput });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // verify token on login
    login: async (
      _parent: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError;
      }
      const correctPW = await user.isCorrectPassword(password);
      if (!correctPW) {
        throw AuthenticationError;
      }
      const token = signToken(user.username, user.email, user._id);

      return { token, user };
    },
    // save  a book
    saveBook: async (
      _parent: unknown,
      { bookInput }: AddBookArgs,
      context: Context
    ): Promise<User | null> => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: { ...bookInput } } },
          { new: true, runValidators: true }
        );
      }
      throw AuthenticationError;
    },
    // remove a book
    removeBook: async (
      _parent: unknown,
      { bookId }: RemoveBookArgs,
      context: Context
    ): Promise<User | null> => {
      if (context.user) {
        return await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
      }
      throw AuthenticationError;
    },
  },
};

export default resolvers;
