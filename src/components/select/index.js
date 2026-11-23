import React from "react";
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";

const SelectComponent = ({ title, items, initialKey, handleChangeCallBack }) => (
  <Box>
    <FormControl fullWidth>
      <Typography>{title}</Typography>
      <Select size="small" value={initialKey == null ? "" : initialKey}
        onChange={(event) => handleChangeCallBack(event.target.value)}
        displayEmpty sx={{ color: "#11192A" }}>
        {items.map((item) => (
          <MenuItem key={item.key} value={item.key}>{item.value}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);
export default SelectComponent;
