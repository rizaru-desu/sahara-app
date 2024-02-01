import { InputAdornment, TextField } from "@mui/material";
import _ from "lodash";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { toastMessage } from "./toasttify";

type Props = {
  onSearch: ({ value }: { value: string }) => void;
};

function Search({ onSearch }: Props) {
  const [value, setValue] = React.useState<string>("");

  return (
    <form
      className="flex items-center m-[2px] mb-3"
      action="#"
      method="POST"
      onSubmit={(e: any) => {
        e.preventDefault();
        if (_.size(value) >= 3) {
          onSearch({ value });
        } else {
          toastMessage({
            message: "Minimum of 3 letters",
            type: "error",
          });
        }
      }}
    >
      <TextField
        name="value"
        id="value"
        label="Search"
        type={"text"}
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <button className="text-black" type="submit">
                <FaSearch size={20} />
              </button>
            </InputAdornment>
          ),
        }}
        onChange={(e: any) => {
          setValue(e.target.value);
        }}
      />
    </form>
  );
}

export default Search;
