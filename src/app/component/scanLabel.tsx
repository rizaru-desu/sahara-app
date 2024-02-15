import { InputAdornment, TextField } from "@mui/material";
import _ from "lodash";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { toastMessage } from "./toasttify";

type Props = {
  onSearch: ({ value }: { value: string }) => void;
  value: any;
};

function ScanLabel({ onSearch, value }: Props) {
  return (
    <div className="flex items-center m-[2px] mb-3">
      <TextField
        name="value"
        id="value"
        label="Scan"
        type={"text"}
        size="small"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        value={value}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <button className="text-black" type="submit">
                <FaSearch size={20} />
              </button>
            </InputAdornment>
          ),
        }}
        onChange={(e) => {
          const { value } = e.target;
          if (_.size(value) >= 3) {
            onSearch({ value });
          } else {
            toastMessage({
              message: "Minimum of 3 letters",
              type: "error",
            });
          }
        }}
      />
    </div>
  );
}

export default ScanLabel;
