import { useQuery } from "@apollo/client"
import { ME, ALL_BOOKS_BY_GENRE} from "../queries"

const Recomended = (props) =>{
    const userResults = useQuery(ME)
    const genreResults = useQuery(ALL_BOOKS_BY_GENRE, {
        variables: { genre:(userResults.data?userResults.data.me.favoriteGenre:"") },
        skip: !(userResults.data?userResults.data.me.favoriteGenre:""),
    })

    if (genreResults.loading && userResults.loading)  {
        return <div>loading...</div>
    }

    if (!props.show) {
    return null
    }

    const books = (genreResults.data?genreResults.data.allBooks:[])

    return (
        <div>
            <h2>recomendations</h2>
            <div>
                books in your favorite genre {userResults.data.me.favoriteGenre}
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
        </div>
    )
}

export default Recomended