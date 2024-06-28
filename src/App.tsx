import AddBox from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownload from "@mui/icons-material/FileDownload";
import SaveIcon from "@mui/icons-material/Save";
import {
	AppBar,
	ButtonGroup,
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
import { useFlatDeps } from "./FlatStore.ts";
import {
	deleteLocal,
	deleteMemory,
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

	const flatsStore = useFlatDeps();

	const [sourcePath, setSourcePath] = useState("");
	const [searchStringState, setSearchStringState] = useState<string>("");

	const [token, setToken] = useState<string>("");
	const [org, setOrg] = useState<string>("");

	async function loadDepsFromStore() {
		loadFromStore("").then((flats) => flatsStore.setDeps(flats || []));
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
			flatsStore.setDeps(result);
		}
	}, 400);

	function debouncedReloadAndSearch(value: string) {
		setSearchStringState(value);
		debouncedSetSearch(value)?.then();
	}

	async function save() {
		await loadIntoLocal();
	}

	async function deleteAllLocal() {
		await deleteLocal();
	}

	async function deleteAllMemory() {
		await deleteMemory();
		flatsStore.clear();
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

						<Box
							height={10}
							width={1000}
							marginLeft={100}
							display="flex"
							alignItems="center"
							gap={1}
							p={2}
						>
							<ButtonGroup variant="contained" aria-label="button group 1">
								<Button variant="contained" disabled>
									Interim Store
								</Button>
								<Button onClick={toggleDrawer(true)} startIcon={<AddBox />}>
									Import dependencies
								</Button>
								<Button
									variant="text"
									startIcon={<DeleteIcon />}
									onClick={deleteAllMemory}
								>
									Delete
								</Button>
							</ButtonGroup>

							<Divider orientation="vertical" variant="middle" flexItem />

							<ButtonGroup variant="contained" aria-label="button group 2">
								<Button variant="contained" disabled>
									State Store
								</Button>
								<Button onClick={save} startIcon={<SaveIcon />}>
									Save
								</Button>
								<Button
									variant="contained"
									onClick={load}
									startIcon={<FileDownload />}
								>
									Load
								</Button>
								<Button
									variant="text"
									onClick={deleteAllLocal}
									startIcon={<DeleteIcon />}
								>
									Delete
								</Button>
							</ButtonGroup>
						</Box>
					</Toolbar>
				</AppBar>

				<FlatDepCompOrNothing
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
						gap={2}
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
