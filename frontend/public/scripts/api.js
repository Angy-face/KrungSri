import { BACKEND_URL } from "./config.js";

export async function getItems() {
  /** @type {Item[]} */
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());
  return items;
}

export async function chat(messages) {
  await fetch(`${BACKEND_URL}/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
}

export async function createRecipe(messages) {
  await fetch(`${BACKEND_URL}/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
}

export async function deleteItem(id) {
  await fetch(`${BACKEND_URL}/recipes/${id}`, {
    method: "DELETE",
  });
}

export async function deleteItem(id) {
  await fetch(`${BACKEND_URL}/recipes/${id}`, {
    method: "DELETE",
  });
}
