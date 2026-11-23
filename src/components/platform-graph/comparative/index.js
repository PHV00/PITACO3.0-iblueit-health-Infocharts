import React from "react";
import { Box } from "@mui/material";
import SharedLineChart from "../SharedLineChart";

// Same presentation engine as PITACO 3.0 charts.
// Cohort series is omitted for sessions with insufficient authorized data.
const PlatformGraphComparative = ({ tableLegend_Y, graphData = [] }) => (
  <Box sx={{ backgroundColor: "#fff", color: "#11192A", mt: 2 }}>
    <SharedLineChart
      data={graphData} xKey="name" height={420} yAxisLabel={tableLegend_Y}
      lines={[
        { key: "value", label: "Paciente selecionado", color: "#2563eb" },
        { key: "cohortMedian", label: "Mediana do grupo autorizado", color: "#0f766e" }
      ]}
      emptyLabel="Sem medições reais para os filtros selecionados."
    />
  </Box>
);
export default PlatformGraphComparative;
