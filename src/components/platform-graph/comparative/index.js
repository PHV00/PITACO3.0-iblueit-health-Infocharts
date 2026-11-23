import React from "react";
import { Box, Typography } from "@mui/material";
import { CartesianGrid, Line, LineChart, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis } from "recharts";

// All data must come from the API; never render randomized sample values.
const PlatformGraphComparative = ({ tableLegend_Y, graphData = [], viewType }) => {
  if (!graphData.some((d) => d.value !== null && d.value !== undefined)) {
    return <Typography color="text.secondary">Sem medições reais para os filtros selecionados.</Typography>;
  }
  return (
    <Box sx={{ height: 420, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={graphData} margin={{ top: 15, right: 40, left: 25, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis width={75} label={{ value: tableLegend_Y, angle: -90,
            position: "insideLeft" }} domain={["auto", "auto"]} />
          <Tooltip />
          <Legend />
          <Line type="linear" dataKey="value" name="Paciente selecionado"
            stroke="#2563eb" connectNulls={false} isAnimationActive={false} />
          <Line type="linear" dataKey="cohortMedian" name="Mediana do grupo autorizado"
            stroke="#0f766e" strokeDasharray="5 5" connectNulls={false}
            isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
export default PlatformGraphComparative;
