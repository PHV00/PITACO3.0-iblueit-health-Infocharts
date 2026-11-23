import React from "react";
import { Box } from "@mui/material";
import SelectComponent from "../select";

const DeviceSelect = ({ device, setDevice }) => (
  <Box sx={{ width: 200, marginRight: 2 }}>
    <SelectComponent title="Dispositivo" initialKey={device}
      handleChangeCallBack={setDevice}
      items={[
        { key: "Pitaco", value: "Pitaco" },
        { key: "Pitaco 3.0", value: "Pitaco 3.0" },
        { key: "Mano", value: "Manovacuômetro" },
        { key: "Cinta", value: "Cinta" }
      ]} />
  </Box>
);
export default DeviceSelect;
