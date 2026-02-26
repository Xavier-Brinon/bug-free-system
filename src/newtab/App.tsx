import { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { useQuery } from "@tanstack/react-query";
import { appMachine } from "../machines/appMachine";
import { loadBookTabData, QUERY_KEY } from "../storage";

export function App() {
  const [state, send] = useMachine(appMachine);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadBookTabData,
  });

  // Bridge TanStack Query state to XState machine events
  useEffect(() => {
    if (data && !isLoading) {
      send({ type: "DATA_LOADED", data });
    }
    if (isError && error) {
      send({
        type: "DATA_FAILED",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [data, isLoading, isError, error, send]);

  if (state.matches("loading")) {
    return (
      <div className="app">
        <p>Loading your library...</p>
      </div>
    );
  }

  if (state.matches("error")) {
    return (
      <div className="app">
        <p>Something went wrong.</p>
        <button type="button" onClick={() => send({ type: "RETRY" })}>
          Retry
        </button>
      </div>
    );
  }

  // ready state
  return (
    <div className="app">
      <h1>BookTab</h1>
      <p>Your library is ready. No books yet.</p>
    </div>
  );
}
