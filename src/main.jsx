import { createRoot } from "react-dom/client";
import AppProviders from "./app/providers/AppProviders";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AppProviders />
);