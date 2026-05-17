"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmtN } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

interface SpendChartProps {
  transactions: Transaction[];
}

const COLORS = ["#00D4AA", "#3B82F6", "#EF4444", "#F59E0B", "#10B981"];

function categorize(service: string): string {
  const s = service.toLowerCase();
  if (s.includes("airtime")) return "Airtime";
  if (s.includes("data")) return "Data";
  if (s.includes("electricity")) return "Electricity";
  if (s.includes("cable") || s.includes("tv")) return "Cable TV";
  return "Other";
}

export default function SpendChart({ transactions }: SpendChartProps) {
  // Memoize the aggregation so it doesn't recompute on every render
  const data = useMemo(() => {
    const debitTxns = transactions.filter(
      (tx) => tx.type === "debit" && tx.status === "success"
    );

    const spendByCategory = debitTxns.reduce<Record<string, number>>((acc, tx) => {
      const category = categorize(tx.service || "");
      const amount = typeof tx.amount === "number" ? tx.amount : parseFloat(String(tx.amount));
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(spendByCategory).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 20,
          padding: 24,
          border: "1px solid var(--border)",
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          No spend data available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 20,
        padding: 24,
        border: "1px solid var(--border)",
        height: 300,
      }}
      role="img"
      aria-label="Spend analysis chart"
    >
      <h3
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 16,
        }}
      >
        Spend Analysis
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
            }
            labelLine={false}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => fmtN(value)}
            contentStyle={{
              background: "#0D1426",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
