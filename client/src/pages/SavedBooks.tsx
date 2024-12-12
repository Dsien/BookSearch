import { Container, Card, Button, Row, Col } from "react-bootstrap";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";

const SavedBooks: React.FC = () => {
  const { loading, data } = useQuery(GET_ME);

  const user = data?.me || {};

  // useMutation to remove a book
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      if (!data) {
        throw new Error('something went wrong!');
      }

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <Container>
      <h2>
        {user.savedBooks?.length
          ? `Viewing ${user.savedBooks.length} saved ${user.savedBooks.length === 1 ? 'book' : 'books'}:`
          : 'You have no saved books!'}
      </h2>
      <Row>
        {user.savedBooks?.map((book: any) => (
          <Col md="4" key={book.bookId}>
            <Card border="dark">
              {book.image ? (
                <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />
              ) : null}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button className="btn-block btn-danger" onClick={() => handleDeleteBook(book.bookId)}>
                  Delete this Book!
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;
