// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import CategoryNew from "./pages/CategoryNew";
import { useAuth } from "./hooks/useAuth";

type GuardProps = { children: React.ReactNode };

function RequireAuth({ children }: GuardProps) {
  const authed = useAuth();

  if (authed === null) return <>Loading...</>;
  if (authed === false) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function GuestOnly({ children }: GuardProps) {
  const authed = useAuth();

  if (authed === null) return <>Loading...</>;
  if (authed === true) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />

        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />

        <Route
          path="/main"
          element={
            <RequireAuth>
              <Main />
            </RequireAuth>
          }
        />

        <Route
          path="/category/new"
          element={
            <RequireAuth>
              <CategoryNew />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
