"use client";

import { useState } from "react";

// A plain <button>, not a <form>: this renders inside Payload's document
// <form>, and forms cannot be nested (hydration error).
export function CalendarDisconnectButton({
  endpoint,
  donePage,
}: {
  endpoint: string;
  donePage: string;
}) {
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => null);
    window.location.assign(
      response?.ok ? `${donePage}?calendar=disconnected` : donePage,
    );
  }

  return (
    <button
      type="button"
      className="btn btn--style-secondary btn--size-small"
      disabled={busy}
      onClick={() => void disconnect()}
    >
      {busy ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
