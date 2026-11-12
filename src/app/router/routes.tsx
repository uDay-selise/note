import { useEffect, useState } from "react";
import { RedirectIfAuthenticated, RequireAuth } from "./guards";
import { CallbackPage } from "../../features/auth/CallbackPage";
import { ErrorPage } from "../../features/auth/ErrorPage";
import { NotFoundPage } from "../../features/auth/NotFoundPage";
import { ListsPage } from "../../features/lists/ListsPage";
import { WelcomePage } from "../../features/welcome/WelcomePage";
import { TaskPage } from "../../features/task/TaskPage";

export function AppRouter() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextPath: string) {
    const [nextPathname = "/", queryString = ""] = nextPath.split("?");
    window.history.pushState({}, "", nextPath);
    setPath(nextPathname);
    setSearch(queryString ? `?${queryString}` : "");
  }

  if (path === "/login/callback") {
    return <CallbackPage onNavigate={navigate} />;
  }

  if (path === "/login") {
    return (
      <RedirectIfAuthenticated onNavigate={navigate}>
        <WelcomePage onNavigate={navigate} />
      </RedirectIfAuthenticated>
    );
  }

  if (path === "/error") {
    return <ErrorPage />;
  }

  if (path === "/") {
    return (
      <RedirectIfAuthenticated onNavigate={navigate}>
        <WelcomePage onNavigate={navigate} />
      </RedirectIfAuthenticated>
    );
  }

  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch) {
    return (
      <RequireAuth currentPath={path} onNavigate={navigate}>
        <TaskPage taskId={decodeURIComponent(taskMatch[1] ?? "")} onNavigate={navigate} />
      </RequireAuth>
    );
  }

  if (path === "/lists") {
    return (
      <RequireAuth currentPath={path} onNavigate={navigate}>
        <ListsPage onNavigate={navigate} />
      </RequireAuth>
    );
  }

  return <NotFoundPage onNavigate={navigate} />;
}
