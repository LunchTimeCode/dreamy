import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Button from "@mui/material/Button";
import "./App.css";
import { FlatDepCompOrNothing } from "./FlatDep.tsx";
import { Tab, Tabs } from "@mui/material";
import { Box } from "@mui/material";
import * as React from "react";
import { FlatDep } from "./Represenation.ts";
import { useDebounceCallback } from "usehooks-ts";

function App() {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [sourcePath, setSourcePath] = useState("");
  const [flat, setFlat] = useState<FlatDep[]>();
  const [searchString, setSearchString] = useState<string>("");

  async function fromRustFlat() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = await invoke("load_flattend_filter", {
      name: sourcePath,
      filter: searchString,
    });
    if (typeof result === "string") {
      const flat = asFlat(result);
      if (flat) {
        console.log("setting result: ", result);
        setFlat(flat);
      } else {
        console.log("no valid result: ", result);
      }
    }
  }

  function debouncedReloadAndSearch(value: string) {
    fromRustFlat().then(() => {
      setSearchString(value);
    });
  }

  const debouncedSetSearch = useDebounceCallback(debouncedReloadAndSearch, 400);

  async function openDialog(): Promise<void> {
    const file = await open({
      multiple: false,
      directory: true,
    });
    if (file) {
      console.log(file);
      setSourcePath(file);
    }
  }

  async function loadFlat() {
    console.log("loadingFlat");
    await fromRustFlat();
  }

  function asFlat(raw: string): FlatDep[] | undefined {
    if (raw.length == 0) {
      return undefined;
    } else {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return undefined;
      }
    }
  }

  return (
    <>
      <div className="container">
        <h4>Dream about dependencies!</h4>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="All Flat" {...a11yProps(0)} />
              <Tab label="Download in the app" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <div className="row"></div>

          <CustomTabPanel value={value} index={0}>
            <Button onClick={openDialog}>Choose File</Button>
            <Button onClick={loadFlat}>Load flat Dependencies</Button>
            <div className="container">
              <FlatDepCompOrNothing
                w={flat}
                setSearchValue={debouncedSetSearch}
              />
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}></CustomTabPanel>
        </Box>
      </div>
    </>
  );
}

export default App;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
