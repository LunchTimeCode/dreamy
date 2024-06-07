import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";
import '@picocss/pico'
import './App.css'

function App() {
    const [sourcePath, setSourcePath] = useState("/home/silen/pers/dreamy/out");

    const [greetMsg, setGreetMsg] = useState("");

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        setGreetMsg(await invoke("greet", { name:  sourcePath }));
    }

    async function openDialog(): Promise<void> {
        const file = await open({
            multiple: false,
            directory: true,
        });
        if (file) {
            console.log(file)
            setSourcePath(file);
        }
    }


    async function show() {
        console.log("showing")
        await greet();
    }

    return (
        <>
            <div className="container">
                <h1>Dream about dependencies!</h1>

                <div className="row">

                </div>

                <p>Load file</p>

                <button onClick={openDialog}>Choose</button>
                <button onClick={show}>Show</button>

                <p>{greetMsg}</p>
            </div>
        </>

    );

}


export default App;
