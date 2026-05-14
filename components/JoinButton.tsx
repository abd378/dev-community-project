"use client";

import { useState } from "react";

export default function JoinButton() {
  const [joined, setJoined] = useState(false);

  return (
    <div>
      <button onClick={() => setJoined(!joined)}>
        {joined ? "Joined" : "Join Community"}
      </button>
    </div>
  );
}