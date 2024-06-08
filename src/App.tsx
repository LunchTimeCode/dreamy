import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Button from "@mui/material/Button";
import "./App.css";
import { CompOrNothing } from "./Dep";

function App() {
  const [sourcePath, setSourcePath] = useState("/home/silen/pers/dreamy/out");

  const [json, setJson] = useState<OrgWrapper>();

  async function fromRust() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = await invoke("greet", { name: sourcePath });
    if (typeof result === "string") {
      const org = asJson(result);
      if (org) {
        console.log("setting result: ", result);
        setJson(org);
      } else {
        console.log("no valid result: ", result);
      }
    }
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

  async function load() {
    console.log("loading");
    await fromRust();
  }

  function asJson(raw: string): OrgWrapper | undefined {
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

        <div className="row"></div>

        <p>Load file</p>

        <Button onClick={openDialog}>Choose</Button>
        <Button onClick={load}>Load Dependencies</Button>
        <div className="container">
          <CompOrNothing w={json} />
        </div>
      </div>
    </>
  );
}

export default App;
