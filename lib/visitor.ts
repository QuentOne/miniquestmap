const VISITOR_ID_KEY = "questmap_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}
