import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    me {
      email
      username
      bookCount
      _id
      password
      savedBooks {
        authors
        bookId
        description
        image
        link
        title
      }
    }
  }
`;