import { Redirect, useLocation } from "wouter";

/** Web alias — mobile uses `/my-livia`; bookmarks and old links should land on `/my`. */
export function MyLiviaAliasRedirect() {
  const [location] = useLocation();
  const target = location.replace(/^\/my-livia(\/?)/, "/my$1");
  return <Redirect to={target || "/my"} />;
}
