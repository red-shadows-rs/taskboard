"use client";

import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { PageTitle } from "@/components/common/titleCommon";
import { MembersManagement } from "@/components/pages/membersPage";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";

import type { User, UserRole } from "@/types";

interface TeamMembersProps {
  user: User;
}

export function TeamMembers({ user }: TeamMembersProps) {
  const { t } = useLanguage();
  const { users, setUsers } = useStore();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      }
    } catch (_error) {
      toast.error(t("dashboard.team.messages.error.fetchFailed"));
    }
  }, [setUsers, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddMember = useCallback(
    async (member: Omit<User, "id">) => {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        });

        if (response.ok) {
          await fetchUsers();
          toast.success(t("dashboard.team.messages.success.added"));
        } else {
          toast.error(t("dashboard.team.messages.error.addFailed"));
        }
      } catch (_error) {
        toast.error(t("dashboard.team.messages.error.addFailed"));
      }
    },
    [fetchUsers, t],
  );

  const handleUpdateMember = useCallback(
    async (id: string, updates: Partial<User>) => {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          await fetchUsers();
          toast.success(t("dashboard.team.messages.success.updated"));
        } else {
          toast.error(t("dashboard.team.messages.error.updateFailed"));
        }
      } catch (_error) {
        toast.error(t("dashboard.team.messages.error.updateFailed"));
      }
    },
    [fetchUsers, t],
  );

  const handleDeleteMember = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchUsers();
          toast.success(t("dashboard.team.messages.success.deleted"));
        } else {
          toast.error(t("dashboard.team.messages.error.deleteFailed"));
        }
      } catch (_error) {
        toast.error(t("dashboard.team.messages.error.deleteFailed"));
      }
    },
    [fetchUsers, t],
  );

  const handleReorderMembers = useCallback(
    async (updates: { id: string; order: number; role?: UserRole }[]) => {
      try {
        const response = await fetch("/api/users/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });

        if (response.ok) {
          await fetchUsers();
        } else {
          toast.error(t("dashboard.team.messages.error.updateFailed"));
        }
      } catch (_error) {
        toast.error(t("dashboard.team.messages.error.updateFailed"));
      }
    },
    [fetchUsers, t],
  );

  return (
    <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
      <PageTitle title="team" />
      <MembersManagement
        currentUser={user}
        users={users}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onReorderMembers={handleReorderMembers}
      />
    </main>
  );
}
