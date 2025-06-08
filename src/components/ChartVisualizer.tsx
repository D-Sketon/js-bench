import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useBenchmarkStore } from "../store";
import { useTranslation } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { useLanguageChange } from "../hooks/useLanguageChange";
import { useThemeChange } from "../hooks/useThemeChange";

export const ChartVisualizer: React.FC = () => {
  const { results } = useBenchmarkStore();
  const { t } = useTranslation();
  const { theme } = useTheme();

  useLanguageChange();
  useThemeChange();

  const chartData = useMemo(() => {
    return results
      .filter((r) => !r.error)
      .map((result) => ({
        name: result.name,
        ops: result.ops,
        avg: result.avg,
        p99: result.p99,
        p75: result.p75,
        opsK: Math.round(result.ops / 1000),
      }));
  }, [results]);
  
  const colors = {
    primary: theme === "dark" ? "#1f6feb" : "#3B82F6",
    secondary: theme === "dark" ? "#238636" : "#10B981",
    accent: theme === "dark" ? "#da7633" : "#F59E0B",
    danger: theme === "dark" ? "#da3633" : "#EF4444",
    text: {
      primary: theme === "dark" ? "#e6edf3" : "#1F2937",
      secondary: theme === "dark" ? "#7d8590" : "#6B7280",
      muted: theme === "dark" ? "#656d76" : "#9CA3AF",
    },
    background: {
      primary: theme === "dark" ? "#0d1117" : "#FFFFFF",
      secondary: theme === "dark" ? "#161b22" : "#F9FAFB",
      tertiary: theme === "dark" ? "#21262d" : "#F3F4F6",
    },
    border: {
      primary: theme === "dark" ? "#21262d" : "#E5E7EB",
      secondary: theme === "dark" ? "#30363d" : "#D1D5DB",
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary p-8 transition-colors">
        <div className="text-center text-gray-500 dark:text-dark-text-secondary">
          <TrendingUp
            size={48}
            className="mx-auto mb-4 text-gray-300 dark:text-dark-text-muted"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            {t("noChartDataTitle")}
          </h3>
          <p>{t("noChartDataDesc")}</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        ops: number;
        avg: number;
        p99: number;
        p75: number;
        opsK: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="p-3 border rounded-lg shadow-lg transition-colors"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
          }}
        >
          <p 
            className="font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <p style={{ color: colors.primary }}>
              <span className="font-medium">{t("opsPerSec")}:</span>{" "}
              {data.ops?.toLocaleString()}
            </p>
            <p style={{ color: colors.secondary }}>
              <span className="font-medium">{t("avgTime")}:</span>{" "}
              {data.avg?.toFixed(4)}
              {t("μs")}
            </p>
            <p style={{ color: colors.accent }}>
              <span className="font-medium">{'p99'}:</span>{" "}
              {data.p99?.toFixed(4)}
              {t("μs")}
            </p>
            <p style={{ color: colors.accent }}>
              <span className="font-medium">{'p75'}:</span>{" "}
              {data.p75?.toFixed(4)}
              {t("μs")}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-primary overflow-hidden transition-colors h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary transition-colors flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {t("performanceVisualization")}
          </h3>
          <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
            {chartData.length} {t("testCases")}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border.secondary}
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fill: colors.text.secondary,
              }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: colors.border.primary }}
              tickLine={{ stroke: colors.border.primary }}
            />
            <YAxis
              tick={{
                fontSize: 12,
                fill: colors.text.secondary,
              }}
              label={{
                value: t("opsPerSecK"),
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: colors.text.secondary,
                },
              }}
              axisLine={{ stroke: colors.border.primary }}
              tickLine={{ stroke: colors.border.primary }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend
              wrapperStyle={{
                color: colors.text.secondary,
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="opsK"
              name={t("opsPerSecK")}
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
              stroke={colors.border.primary}
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
