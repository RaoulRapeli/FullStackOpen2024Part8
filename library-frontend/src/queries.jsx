import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title,
    author{
      name
    },
    published,
    genres
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    )
    {
      title,
      author{
        name
      },
      published,
      genres
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks  {
      title,
      author{
        name
      },
      published,
      genres
    }
  }
`
export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      born,
      bookCount
    }
  }
`

export const ALL_BOOKS_BY_GENRE = gql`
  query findBookByGenre($genre: String!){
    allBooks(genre: $genre) {
      title,
      author{
        name
      },
      published,
      genres
    }
  }
`

export const ME = gql`
query{
  me {
    username,
    favoriteGenre
  }
}
`