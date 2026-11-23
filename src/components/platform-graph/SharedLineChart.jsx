import React from "react";
import { Box, Typography } from "@mui/material";
import { shouldAnimateChart, CHART_ANIMATION_MS } from "../../services/chartPresentation";
import {
  ComposedChart, CartesianGrid, Legend, Line, ReferenceArea, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

const INK = "#11192A";
const validNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Shared Recharts presentation for legacy cohort, PITACO 3.0 stage and historical
// physiology. Keep source data outside the chart; never synthesize values.
function SharedLineChart({
  data = [], lines = [], xKey = "name", numericXAxis = false,
  height = 310, yAxisLabel, reference = null, tooltipContent, emptyLabel
}) {
  const hasMeasurements = data.some((point) => lines.some((line) => validNumber(point[line.key])));
  if (!hasMeasurements) {
    return (
      <Typography sx={{ color: INK }}>
        {emptyLabel || "Não há medições reais disponíveis para estes filtros."}
      </Typography>
    );
  }

  // Streaming min/max avoids a large spread call for dense respiratory data.
  let min = reference ? reference.lower : Infinity;
  let max = reference ? reference.upper : -Infinity;
  data.forEach((point) => lines.forEach((line) => {
    const value = point[line.key];
    if (validNumber(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }));
  const gap = Math.max((max - min) * 0.05, 1);
  const domain = [min - gap, max + gap];

  return (
    <Box sx={{ height, width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}
          margin={{ top: 18, right: 35, left: 16, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce3ec" />
          <XAxis dataKey={xKey} type={numericXAxis ? "number" : "category"}
            domain={numericXAxis ? ["dataMin", "dataMax"] : undefined}
            tickFormatter={numericXAxis ? (v) => Number(v).toFixed(0) : undefined}
            tick={{ fill: INK, fontSize: 12 }} />
          <YAxis domain={domain} tick={{ fill: INK, fontSize: 12 }}
            width={72}
            label={yAxisLabel ? {
              value: yAxisLabel, angle: -90, position: "insideLeft",
              fill: INK, fontSize: 12, dy: 15
            } : undefined} />
          <Tooltip
            content={tooltipContent || undefined}
            labelFormatter={numericXAxis ? (v) => `${Number(v).toFixed(2)} s` : undefined}
            contentStyle={{ color: INK, backgroundColor: "#fff", borderColor: "#dce3ec" }}
            labelStyle={{ color: INK }}
            itemStyle={{ color: INK }} />
          {lines.length > 1 && <Legend wrapperStyle={{ color: INK }} />}
          {reference && (
            <ReferenceArea y1={reference.lower} y2={reference.upper}
              stroke="#a77c17" strokeDasharray="4 4"
              fill="#e9c46a" fillOpacity={0.18}
              ifOverflow="extendDomain" />
          )}
          {lines.map((line) => (
            <Line key={line.key} type="linear" dataKey={line.key}
              name={line.label} stroke={line.color || "#2563eb"}
              dot={false} activeDot={{ r: 4 }} strokeWidth={1.8}
              isAnimationActive={shouldAnimateChart(data.length)}
              animationDuration={CHART_ANIMATION_MS} animationEasing="ease-out"
              connectNulls={false} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default React.memo(SharedLineChart);
