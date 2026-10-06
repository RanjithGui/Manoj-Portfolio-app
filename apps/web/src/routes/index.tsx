import { createFileRoute } from "@tanstack/react-router";

import { Portfolio } from "@/portfolio/Portfolio";

export const Route = createFileRoute("/")({
  component: Portfolio,
});
