const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount: async () => await Book.find({}).length,
      authorCount: async () => await Author.find({}).length,
      allBooks: async (root, args) => {
        if(args.author && args.genre){
          const books = await Book.find({genres:args.genre}).populate('author')
          return  books.filter(book => book.author.name === args.author)
        }
        else if(args.author){
            const books = await Book.find({}).populate('author')
            return  books.filter(book => book.author.name === args.author)
        }
        else if(args.genre){
            return await Book.find({genres:args.genre}).populate('author')
        }
        else{
          return await Book.find({}).populate('author')
        }
      },
      allAuthors: async () => {
        var authors = await Author.find({}).populate("books")
        authors.map(async author => {
            author.bookCount = author.books.length
            return author
        })
        return authors
      },
      me:(root, args, context) => {
        return context.currentUser
      }
    },
    Mutation: {
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
        var tempAuthor = await Author.find({ name: args.author}).populate("books")
        if(tempAuthor.length===0){
          var new_Author = new Author({
            name:args.author,
            born:null,
            books:[]
          })
          try {
            tempAuthor = [await new_Author.save()]
          } catch (error) {
            throw new GraphQLError('Adding new author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          }
        }
  
        args.author = tempAuthor[0]._id
        var new_Book = new Book({ ...args })
        try {
          var savedBook = await new_Book.save()
          var returnValues = {...savedBook._doc,author:tempAuthor[0]}
          pubsub.publish('BOOK_ADDED', { bookAdded: returnValues })
          await Author.findByIdAndUpdate(tempAuthor[0]._id, { books: tempAuthor[0].books.concat(returnValues._id)})
          return returnValues
        } catch (error) {
          throw new GraphQLError('Adding new book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
      },
      editAuthor: async (root, args, context) => {
          const currentUser = context.currentUser
          if (!currentUser) {
            throw new GraphQLError('not authenticated', {
              extensions: {
                code: 'BAD_USER_INPUT',
              }
            })
          }
          const author = await Author.find({name: args.name})
          if(author.length!==0){
              author[0].born = args.setBornTo
              try {
                return await Author.findByIdAndUpdate(author[0]._id, { born: author[0].born})
              } catch (error) {
                throw new GraphQLError('Updating authors birthday failed', {
                  extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args.name,
                    error
                  }
                })
              }
          }
          else{
              return null
          }
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        
        return user.save()
          .catch(error => {
            throw new GraphQLError('Creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.username,
                error
              }
            })
          })
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'secret' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })        
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
      },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
    },
  }

module.exports = resolvers