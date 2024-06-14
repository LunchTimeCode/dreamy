import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Button from "@mui/material/Button";
import "./App.css";
import { FlatDepCompOrNothing } from "./FlatDep.tsx";
import { Tab, Tabs, TextField } from "@mui/material";
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
  const [searchStringState, setSearchStringState] = useState<string>("");

  const [token, setToken] = useState<string>("");
  const [org, setOrg] = useState<string>("");

  async function loadFromStore(searchString: string) {
    console.log("trying to load with", searchString);
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = await invoke("load_from_store", {
      filter: searchString,
    });
    if (typeof result === "string") {
      const flat = asFlat(result);
      if (flat) {
        setFlat(flat);
      } else {
        console.log("no valid result: ", result);
      }
    }
  }

  async function loadIntoStore() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = await invoke("load_into_store", { name: sourcePath });
    if (typeof result === "string") {
      if (flat) {
        console.log("setting result: ", result);
      } else {
        console.log("no valid result: ", result);
      }
    }
  }

  async function loadFromGithub() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = await invoke("load_from_github", { org: org, token: token });
    if (typeof result === "string") {
      if (flat) {
        console.log("setting result: ", result);
      } else {
        console.log("no valid result: ", result);
      }
    }
  }

  const debouncedSetSearch = useDebounceCallback(loadFromStore, 400);

  function debouncedReloadAndSearch(value: string) {
    setSearchStringState(value);
    console.log("search value", value);

    debouncedSetSearch(value)?.then();
  }

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

  async function loadDeps() {
    loadIntoStore().then(() => {
      loadFromStore("");
    });
  }

  async function loadDepsFromGithub() {
    console.log("trying to call github");
    loadFromGithub().then(() => {
      console.log("tried to call github");
    });
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
              <Tab label="Analyse" {...a11yProps(0)} />
              <Tab label="Load Dependencies" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <div className="row"></div>

          <CustomTabPanel value={value} index={0}>
            <FlatDepCompOrNothing
              w={flat}
              value={searchStringState}
              setSearchValue={debouncedReloadAndSearch}
            />
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <Button onClick={openDialog}>Choose File</Button>
            <Button onClick={loadDeps}>Load From File</Button>
            <TextField
              id="outlined-basic1"
              label="Org"
              variant="outlined"
              value={org}
              onChange={(v) => {
                setOrg(v.target.value);
              }}
            />
            <TextField
              id="outlined-basic2"
              label="token"
              variant="outlined"
              value={token}
              onChange={(v) => {
                setToken(v.target.value);
              }}
            />
            <Button onClick={loadDepsFromGithub}>Load From Github</Button>
          </CustomTabPanel>
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
