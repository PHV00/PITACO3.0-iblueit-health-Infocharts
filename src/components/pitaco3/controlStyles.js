// Light input surfaces shared with the existing I Blue It form convention.
// Explicit colors avoid the global theme's white text inherited by input values.
export const CONTROL_INK = "#11192A";
export const inputSx = {
  minWidth: 130,
  "& .MuiInputBase-root": { color: CONTROL_INK, backgroundColor: "#fff" },
  "& .MuiInputBase-input": { color: CONTROL_INK, WebkitTextFillColor: CONTROL_INK },
  "& .MuiInputLabel-root": { color: CONTROL_INK },
  "& .MuiInputLabel-root.Mui-focused": { color: CONTROL_INK },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#70757F" },
  "& .MuiFormHelperText-root": { color: CONTROL_INK }
};
