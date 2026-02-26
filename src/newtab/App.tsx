import { useEffect, useCallback, useRef } from "react";
import { useMachine } from "@xstate/react";
import { createActor } from "xstate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appMachine } from "../machines/appMachine";
import { libraryMachine } from "../machines/libraryMachine";
import { loadBookTabData, saveBookTabData, QUERY_KEY } from "../storage";
import { createBookRecord } from "../schema";
import type { BookTabData, BookRecord, BookStatus } from "../schema";
import type { BookFormData } from "../components/BookForm";
import { BookForm } from "../components/BookForm";
import { BookList } from "../components/BookList";
import { CurrentlyReading } from "../components/CurrentlyReading";
import { EmptyHero } from "../components/EmptyHero";
import { QueueCount } from "../components/QueueCount";

export function App() {
  const [state, send] = useMachine(appMachine);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadBookTabData,
  });

  // Persistent library machine actor — initialized once when data loads
  const libraryActorRef = useRef<ReturnType<typeof createActor<typeof libraryMachine>> | null>(
    null,
  );

  // Bridge TanStack Query state to XState machine events
  useEffect(() => {
    if (data && !isLoading) {
      send({ type: "DATA_LOADED", data });

      // Initialize library actor with loaded data (only once)
      if (!libraryActorRef.current) {
        const actor = createActor(libraryMachine, {
          input: { books: data.books },
        });
        actor.start();
        libraryActorRef.current = actor;
      }
    }
    if (isError && error) {
      send({
        type: "DATA_FAILED",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [data, isLoading, isError, error, send]);

  // Cleanup actor on unmount
  useEffect(() => {
    return () => {
      libraryActorRef.current?.stop();
    };
  }, []);

  const persistAndInvalidate = useCallback(
    async (updatedBooks: Record<string, BookRecord>) => {
      if (!state.context.data) return;
      const updatedData: BookTabData = {
        ...state.context.data,
        books: updatedBooks,
      };
      await saveBookTabData(updatedData);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    [state.context.data, queryClient],
  );

  const handleAddSubmit = useCallback(
    async (formData: BookFormData) => {
      const actor = libraryActorRef.current;
      if (!actor) return;
      const book = createBookRecord(formData);
      actor.send({ type: "ADD_BOOK", book });
      await persistAndInvalidate(actor.getSnapshot().context.books);
      send({ type: "BOOK_SAVED" });
    },
    [persistAndInvalidate, send],
  );

  const handleEditSubmit = useCallback(
    async (formData: BookFormData) => {
      const actor = libraryActorRef.current;
      if (!actor || !state.context.editingBookId) return;
      actor.send({
        type: "UPDATE_BOOK",
        id: state.context.editingBookId,
        updates: formData,
      });
      await persistAndInvalidate(actor.getSnapshot().context.books);
      send({ type: "BOOK_SAVED" });
    },
    [state.context.editingBookId, persistAndInvalidate, send],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const actor = libraryActorRef.current;
      if (!actor) return;
      actor.send({ type: "DELETE_BOOK", id });
      await persistAndInvalidate(actor.getSnapshot().context.books);
    },
    [persistAndInvalidate],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: BookStatus) => {
      const actor = libraryActorRef.current;
      if (!actor) return;
      actor.send({ type: "SET_STATUS", id, status });
      await persistAndInvalidate(actor.getSnapshot().context.books);
    },
    [persistAndInvalidate],
  );

  const handleEdit = useCallback(
    (id: string) => {
      send({ type: "START_EDIT", bookId: id });
    },
    [send],
  );

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

  // ready.adding
  if (state.matches({ ready: "adding" })) {
    return (
      <div className="app">
        <h1>BookTab</h1>
        <BookForm onSubmit={handleAddSubmit} onCancel={() => send({ type: "CANCEL_FORM" })} />
      </div>
    );
  }

  // ready.editing
  if (state.matches({ ready: "editing" })) {
    const editingBook = state.context.editingBookId
      ? state.context.data?.books[state.context.editingBookId]
      : null;

    return (
      <div className="app">
        <h1>BookTab</h1>
        <BookForm
          onSubmit={handleEditSubmit}
          onCancel={() => send({ type: "CANCEL_FORM" })}
          initialBook={editingBook ?? undefined}
        />
      </div>
    );
  }

  // ready.viewing (default)
  const books = state.context.data?.books ?? {};
  const allBooks = Object.values(books);
  const currentlyReading =
    allBooks
      .filter((b) => b.status === "reading")
      .sort((a, b) => a.addedAt.localeCompare(b.addedAt))[0] ?? null;
  const queueCount = allBooks.filter((b) => b.status === "want_to_read").length;

  return (
    <div className="app">
      <h1>BookTab</h1>
      <section className="hero-section">
        {currentlyReading ? (
          <CurrentlyReading
            book={currentlyReading}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyHero onStartAdding={() => send({ type: "START_ADD" })} />
        )}
      </section>
      <QueueCount count={queueCount} />
      <button type="button" onClick={() => send({ type: "START_ADD" })}>
        Add Book
      </button>
      <BookList
        books={books}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
