import React from "react";
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";

// The global theme uses white text for dark navigation. Form inputs on white
// surfaces must explicitly set ink color, including the selected value.
const ink = "#11192A";
const SelectComponent = ({ title, items, initialKey, handleChangeCallBack }) => (
  <Box>
    <FormControl fullWidth>
      <Typography sx={{ color: ink, mb: 0.25 }}>{title}</Typography>
      <Select size="small" value={initialKey == null ? "" : initialKey}
        onChange={(event) => handleChangeCallBack(event.target.value)}
        displayEmpty
        sx={{
          color: ink,
          backgroundColor: "#fff",
          "& .MuiSelect-select": { color: ink, WebkitTextFillColor: ink },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#70757F" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: ink },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ink }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#fff",
              "& .MuiMenuItem-root": { color: ink },
              "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#e8eef7" }
            }
          }
        }}>
        {items.map((item) => (
          <MenuItem key={item.key} value={item.key}>{item.value}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);
export default SelectComponent;
