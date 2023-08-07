import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Container, Typography } from "@mui/material";

const GET_TODOS = gql`
  query {
    todos {
      id
      text
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`;
const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $text: String!) {
    updateTodo(id: $id, text: $text) {
      id
      text
      completed
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_TODOS);
  const [addTodo] = useMutation(ADD_TODO, {
    update(cache, { data: { addTodo } }) {
      cache.modify({
        fields: {
          todos(existingTodos) {
            const newTodoRef = cache.writeFragment({
              data: addTodo,
              fragment: gql`
                fragment NewTodo on Todo {
                  id
                  text
                  completed
                }
              `,
            });
            return [...existingTodos, newTodoRef];
          },
        },
      });
    },
  });
  // ----------------deltodo------------------
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [toggleTodo] = useMutation(TOGGLE_TODO, {
    update(cache, { data: { toggleTodo } }) {
      cache.modify({
        fields: {
          todos(existingTodos, { readField }) {
            return existingTodos.map((existingTodo) => {
              if (readField("id", existingTodo) === toggleTodo.id) {
                return {
                  ...existingTodo,
                  completed: toggleTodo.completed,
                };
              } else {
                return existingTodo;
              }
            });
          },
        },
      });
    },
  });
  // ----------updatetodo--------------------
  const [updateTodo] = useMutation(UPDATE_TODO, {
    update(cache, { data: { updateTodo } }) {
      cache.modify({
        fields: {
          todos(existingTodos, { readField }) {
            return existingTodos.map((existingTodo) => {
              if (readField("id", existingTodo) === updateTodo.id) {
                return {
                  ...existingTodo,
                  text: updateTodo.text,
                };
              } else {
                return existingTodo;
              }
            });
          },
        },
      });
    },
  });

  const [newTodoText, setNewTodoText] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        background: "#87cefa ",
        width: "50%",
        pb: "50px",
        border: "1px solid black",
        borderRadius: "10px",
        mt: "30px",
      }}
    >
      <h1>Todo App</h1>
      <ul>
        {data.todos.map((todo) => (
          <li key={todo.id}>
            <span
              onClick={() => {
                toggleTodo({
                  variables: { id: todo.id },
                });
              }}
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {todo.text}
            </span>
            {/* -------update----------------- */}
            <input
              type="text"
              value={todo.text}
              onChange={(e) => {
                const updatedText = e.target.value;
                updateTodo({
                  variables: { id: todo.id, text: updatedText },
                  optimisticResponse: {
                    __typename: "Mutation",
                    updateTodo: {
                      __typename: "Todo",
                      id: todo.id,
                      text: updatedText,
                      completed: todo.completed,
                    },
                  },
                });
              }}
            />
            {/* -------delbtn---------- */}
            <button
              onClick={() => {
                deleteTodo({
                  variables: { id: todo.id },
                  update(cache) {
                    cache.modify({
                      fields: {
                        todos(existingTodos, { readField }) {
                          return existingTodos.filter(
                            (existingTodo) =>
                              readField("id", existingTodo) !== todo.id
                          );
                        },
                      },
                    });
                  },
                });
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    {/* ----------addtodo------------------------ */}
      <div>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
        />
        <button
          onClick={() => {
            if (newTodoText.trim() !== "") {
              addTodo({
                variables: { text: newTodoText },
              });
              setNewTodoText("");
            }
          }}
        >
          Add Todo
        </button>
      </div>
    </Container>
  );
}

export default App;
