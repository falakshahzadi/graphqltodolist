const { ApolloServer, gql } = require("apollo-server");

const todos = [];

const typeDefs = gql`
  type Todo {
    id: ID!
    text: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo]
  }

  type Mutation {
    addTodo(text: String!): Todo
    updateTodo(id: ID!, text: String!): Todo
    toggleTodo(id: ID!): Todo
    deleteTodo(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    todos: () => todos,
  },
  Mutation: {
    addTodo: (_, { text }) => {
      const todo = { id: String(todos.length + 1), text, completed: false };
      todos.push(todo);
      return todo;
    },
    toggleTodo: (_, { id }) => {
      const todo = todos.find((todo) => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        return todo;
      }
      return null;
    },
    updateTodo: (_, { id, text }) => {
      const todo = todos.find((todo) => todo.id === id);
      if (todo) {
        todo.text = text;
        return todo;
      }
      return null;
    },
    deleteTodo: (_, { id }) => {
      const index = todos.findIndex((todo) => todo.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
        return true;
      }
      return false;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
