import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("ana sayfada uygulama başlığını gösterir", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Elektronik Tamir Sistemi/i)).toBeInTheDocument();
});
