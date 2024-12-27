import { openDB } from "idb";

const dbPromise = openDB("fishCatchForm", 1, {
  upgrade(db) {
    db.createObjectStore("formData");
    db.createObjectStore("images");
  },
});

export async function getFormData(key) {
  return (await dbPromise).get("formData", key);
}

export async function setFormData(key, val) {
  return (await dbPromise).put("formData", val, key);
}

export async function getImage(key) {
  return (await dbPromise).get("images", key);
}

export async function setImage(key, val) {
  return (await dbPromise).put("images", val, key);
}

export async function deleteImage(key) {
  return (await dbPromise).delete("images", key);
}

export async function clearAllData() {
  const db = await dbPromise;
  await db.clear("formData");
  await db.clear("images");
}
