import React from "react";
import { Button } from "../ui/button";
import { useAuthStore, type AuthState } from "@/store/authStore";
const DashboardLayout = () => {
  const { logout } = useAuthStore() as AuthState;
  return (
    <div>
      DashboardLayout
      <Button
        className=""
        onClick={() => {
          logout();
        }}
      >
        log out
      </Button>
    </div>
  );
};

export default DashboardLayout;
