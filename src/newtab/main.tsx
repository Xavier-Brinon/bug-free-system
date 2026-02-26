import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { createQueryClient } from "../storage";
import { App } from "./App";
import "./App.css";

const queryClient = createQueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
