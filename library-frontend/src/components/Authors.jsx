import { gql, useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'

const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      born,
      bookCount
    }
  }
`
const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo,
    ) {
      name,
      born
    }
  }
`

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setName] = useState("")
  const [setBornTo, setSetBornTo] = useState("")
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      props.notify(messages)
    }
  })
  if (result.loading)  {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const authors = result.data.allAuthors

  const handleUpdate = (event) => {
    event.preventDefault()
    editAuthor({  variables: { name, setBornTo } })
    setName('')
    setSetBornTo(0)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a,index) => (
            <tr key={a.name + index}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2>Set birthday</h2>
        <div>
          <form onSubmit={handleUpdate}>
            <div>
              <span>Name:</span>
              <select onChange={(e) => setName(e.target.value)}>
                {authors.map((a) => {
                  return <option key={a.id} value={a.name}>{a.name}</option>
                })}
              </select>
            </div>
            <div>
              <span>Born:</span>
              <input type='text' onChange={(e) => setSetBornTo(parseInt(e.target.value))}/>
            </div>
            <button type='submit'>update author</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Authors
