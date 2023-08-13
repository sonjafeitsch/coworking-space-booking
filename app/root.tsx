import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { ErrorBoundary } from "./ErrorBoundary";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen bg-meine-nische-background font-sans text-themed-base-text">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <ErrorBoundary />
      </body>
    </html>
  );
}
