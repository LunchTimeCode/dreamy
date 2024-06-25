import Button from "@mui/material/Button";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import "./App.css";
import { Container, Divider, Stack, Tab, Tabs, TextField } from "@mui/material";
import { Box } from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import * as React from "react";
import { useDebounceCallback } from "usehooks-ts";
import { FlatDepCompOrNothing } from "./FlatDep.tsx";
import type { FlatDep } from "./Represenation.ts";
import {
	loadFromGithub,
	loadFromLocal,
	loadFromStore,
	loadIntoLocal,
	loadIntoStore,
} from "./commands.ts";
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

	async function loadDepsFromStore() {
		loadFromStore("").then((flats) => setFlat(flats));
	}

	async function openDialog(): Promise<void> {
		const file = await open({
			multiple: false,
			directory: true,
		});
		if (file) {
			setSourcePath(file);
			await loadIntoStore(sourcePath).then(() => {
				loadDepsFromStore().then();
			});
		}
	}

	async function loadDepsFromGithub() {
		loadFromGithub(org, token).then(() => {
			loadDepsFromStore().then();
		});
	}

	const debouncedSetSearch = useDebounceCallback(async () => {
		const result = await loadFromStore(searchStringState);
		if (result) {
			setFlat(result);
		}
	}, 400);

	function debouncedReloadAndSearch(value: string) {
		setSearchStringState(value);
		debouncedSetSearch()?.then();
	}

	async function save() {
		await loadIntoLocal();
	}

	async function load() {
		loadFromLocal().then(() => {
			loadDepsFromStore().then();
		});
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

					<div className="row" />

					<CustomTabPanel value={value} index={0}>
						<Button onClick={save}>Save</Button>
						<Button onClick={load}>Load</Button>
						<FlatDepCompOrNothing
							w={flat}
							value={searchStringState}
							setSearchValue={debouncedReloadAndSearch}
						/>
					</CustomTabPanel>

					<CustomTabPanel value={value} index={1}>
						<Stack
							direction="row"
							divider={<Divider orientation="vertical" flexItem />}
							spacing={2}
						>
							<Button onClick={openDialog}>Import File</Button>
							<Container>
								<Stack
									divider={<Divider orientation="vertical" flexItem />}
									spacing={1}
								>
									<Button onClick={loadDepsFromGithub}>
										Import From Github
									</Button>
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
								</Stack>
							</Container>
						</Stack>
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
