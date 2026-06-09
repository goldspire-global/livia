import { Redirect } from "expo-router";

/** Marketing and SMS links use /my — native alias to guest hub. */
export default function MyAliasScreen() {
  return <Redirect href="/my-livia" />;
}
