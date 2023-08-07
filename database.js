import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function getTodosByID(id) {
  const { data: todosCreatedByUser, error: errorCreatedByUser } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", id);

  const { data: sharedTodoIds, error: errorSharedWithUser } = await supabase
    .from("shared_todos")
    .select("todo_id")
    .eq("shared_with_id", id);

  if (errorCreatedByUser || errorSharedWithUser) {
    console.log(errorCreatedByUser || errorSharedWithUser);
    return null;
  }

  const todoIdsSharedWithUser = sharedTodoIds.map((item) => item.todo_id);
  const { data: todosSharedWithUser } = await supabase
    .from("todos")
    .select("*")
    .in("id", todoIdsSharedWithUser);

  const combinedTodos = [...todosCreatedByUser, ...todosSharedWithUser];
  return combinedTodos;
}

export async function getTodo(id) {
  const { data, error } = await supabase.from("todos").select("*").eq("id", id);
  return data[0];
}

export async function getTodoByID(id) {
  const { data, error } = await supabase.from("todos").select("*").eq("id", id);
  console.log(data[0]);
}

export async function getSharedTodoByID(id) {
  const { data, error } = await supabase
    .from("shared_todos")
    .select("*")
    .eq("todo_id", id);
  return data[0];
}

export async function getUserByID(id) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id);
  return data[0];
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);
  return data[0];
}

export async function createTodo(user_id, title) {
  const { data, error } = await supabase
    .from("todos")
    .insert([{ user_id: user_id, title: title }]);
  const todoID = data[0].id;
  return getTodo(todoID);
}

export async function deleteTodo(id) {
  const { data, error } = await supabase.from("todos").delete().eq("id", id);
  return data;
}

export async function toggleCompleted(id, value) {
  const newValue = value === true ? true : false;
  const { data, error } = await supabase
    .from("todos")
    .update({ completed: newValue })
    .eq("id", id);
  return data;
}

export async function shareTodo(todo_id, user_id, shared_with_id) {
  const { data, error } = await supabase
    .from("shared_todos")
    .insert([
      { todo_id: todo_id, user_id: user_id, shared_with_id: shared_with_id },
    ]);
  return data[0].id;
}
