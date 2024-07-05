import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from '../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [selectedGenre,setSelectedGenre] = useState("")
  const genreResults = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre:selectedGenre },
    skip: !selectedGenre,
    // pollInterval: 1000
  })

  if (result.loading && genreResults.loading)  {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const books = (!genreResults.data?result.data.allBooks:genreResults.data.allBooks)

  const allGenres = []
  result.data.allBooks.map(book => {
    book.genres.map(genre => {
      if(!allGenres.includes(genre)){
        allGenres.push(genre)
      }
    })
  })

  return (
    <div>
      <h2>books</h2>
      <div>
        in genre <span style={{fontWeight:'bold'}}>{selectedGenre}</span>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {allGenres.map(genre => {
          return <button key={genre} onClick={()=>setSelectedGenre(genre)}>{genre}</button>
        })}
        <button onClick={()=>setSelectedGenre("")}>all genres</button>
      </div>
    </div>
  )
}

export default Books
