import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";
import '@picocss/pico'
import './App.css'

function App() {
    const [sourcePath, setSourcePath] = useState("/home/silen/pers/dreamy/out");

    const [json, setJson] = useState<any>();
    const [org, setOrg] = useState<string>("Nothing chosen yet");

    async function fromRust() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        const result = await invoke("greet", {name: sourcePath})
        if (typeof result === 'string') {
            const jsonx = asJson(result)
            const orgx = jsonx.repos[0]?.organization
            setOrg(orgx)
            setJson(jsonx)
        }

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
        await fromRust();
    }

    function asJson(raw: string): any | undefined {
        if (raw.length == 0) {
            return undefined
        } else {
            return JSON.parse(raw)
        }
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
                <p>{org}</p>
                <div className="container">
                    {json?.repos?.map((dep: any) => {
                        return (
                            <>
                                <details>
                                    <summary><h4>{dep.repo}</h4></summary>
                                    {depResolution(dep.packageData)}
                                    <hr className="rounded"/>
                                </details>
                                <div className="spacing"></div>
                            </>
                        )
                    })}
                </div>
            </div>
        </>

    );

}


export default App;


function DepsTypesComp(depTypes: DepTypes) {
    return (
        <>
            {depTypes.map((value) => {
                if (!value[1]) {
                    return null
                }

                return (<>
                    <details>
                        <summary><h6>{value[0]}</h6></summary>
                        <div role="group">
                            {value[1]?.map((dep) => {
                                return (<DepTypeComp deps={dep.deps}></DepTypeComp>)
                            }) || <>empty</>}
                        </div>
                        <hr/>
                    </details>

                </>)
            })}
        </>
    )
}

function DepTypeComp(props: { deps: Dep[] }) {
    return (<>
        <div>
            {props.deps.map((value) => {
                return (<>
                    <p>{value.depName}: {value.currentValue}</p>
                </>)
            })}
        </div>
    </>)
}


function depResolution(packageData: any) {
    console.log("packageData", packageData);
    return DepsTypesComp(Object.entries(packageData))
}

export type DepTypes = [string, DepType[] | null][]

export interface DepType {
    deps: Dep[]
}

export interface Dep {
    depName: string
    currentValue: string
}