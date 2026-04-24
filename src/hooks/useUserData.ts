import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

export function useUserData() {
  const user = useStore((state) => state.user);
  const setBalance = useStore((state) => state.setBalance);
  const setTransactions = useStore((state) => state.setTransactions);

  // Fetch Balance
  const balanceQuery = useQuery({
    queryKey: ["balance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_wallet_balance", { p_user_id: user?.id });
      if (error) throw error;
      return data as number;
    },
    enabled: !!user?.id,
  });

  // Fetch Transactions
  const transactionsQuery = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update store when data changes
  useEffect(() => {
    if (balanceQuery.data !== undefined) {
      setBalance(balanceQuery.data);
    }
  }, [balanceQuery.data, setBalance]);

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions(transactionsQuery.data);
    }
  }, [transactionsQuery.data, setTransactions]);

  // Real-time listener for transaction updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-data-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => {
          balanceQuery.refetch();
          transactionsQuery.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, balanceQuery, transactionsQuery]);

  return {
    balance: balanceQuery.data ?? 0,
    transactions: transactionsQuery.data ?? [],
    isLoading: balanceQuery.isLoading || transactionsQuery.isLoading,
    refetch: () => {
      balanceQuery.refetch();
      transactionsQuery.refetch();
    }
  };
}
