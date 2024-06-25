import {
	AppBar,
	Divider,
	Drawer,
	Stack,
	TextField,
	Toolbar,
	Typography,
} from "@mui/material";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
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

export function App() {
	const [openx, setOpen] = React.useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
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

	const debouncedSetSearch = useDebounceCallback(async (input) => {
		const result = await loadFromStore(input);
		if (result) {
			setFlat(result);
		}
	}, 400);

	function debouncedReloadAndSearch(value: string) {
		setSearchStringState(value);
		debouncedSetSearch(value)?.then();
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
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Dreamy
						</Typography>

						<Button onClick={toggleDrawer(true)}>Import</Button>
						<Button onClick={save}>Save</Button>
						<Button onClick={load}>Load</Button>
					</Toolbar>
				</AppBar>

				<FlatDepCompOrNothing
					w={flat}
					value={searchStringState}
					setSearchValue={debouncedReloadAndSearch}
				/>

				<Drawer open={openx} anchor="right" onClose={toggleDrawer(false)}>
					<Box
						height={10}
						width={900}
						my={4}
						display="flex"
						alignItems="center"
						gap={4}
						p={2}
					>
						<Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
							Import dependencies
						</Typography>
					</Box>
					<Box component="section" sx={{ p: 2, border: "2px solid grey" }}>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Github
						</Typography>

						<Stack spacing={2} p={2}>
							<TextField
								id="outlined-basic1"
								label="Organisation"
								variant="filled"
								value={org}
								onChange={(v) => {
									setOrg(v.target.value);
								}}
							/>
							<TextField
								id="outlined-basic2"
								label="Token (optional)"
								variant="filled"
								value={token}
								onChange={(v) => {
									setToken(v.target.value);
								}}
							/>
						</Stack>
						<Button onClick={loadDepsFromGithub}>Get dependency graphs</Button>
					</Box>
					<Divider orientation="horizontal" flexItem />

					<Box component="section" sx={{ p: 2, border: "2px solid grey" }}>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Renovate
						</Typography>
						<Button onClick={openDialog}>Import from file</Button>
					</Box>
				</Drawer>
			</div>
		</>
	);
}
