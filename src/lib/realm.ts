// lib/realm.ts
import * as Realm from "realm-web";

const rawRealmId = process.env.REALM_ID;
if (!rawRealmId) {
  throw new Error("NEXT_PUBLIC_REALM_ID is not defined");
}

export const realmApp = new Realm.App({ id: rawRealmId });

