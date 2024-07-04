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
	Tabs,
	TextField,
	Toolbar,
	Typography,
} from "@mui/material";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import * as React from "react";
import { FlatDepCompOrNothing } from "./FlatDep.tsx";
import { useFlatDeps, useLicenseFlatDeps } from "./FlatStore.ts";
import { Import } from "./Import.tsx";
import { LicenseDepCompOrNothing } from "./Licenses.tsx";
import {
	deleteLocal,
	deleteMemory,
	loadFromGithub,
	loadFromLocal,
	loadFromStore,
	loadGhToken,
	loadIntoLocal,
	loadIntoStore,
	loadLicensesFromStore,
} from "./commands.ts";

export function App() {
	const [openx, setOpen] = React.useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	const flatsStore = useFlatDeps();
	const flatsLicenseStore = useLicenseFlatDeps();

	const [value, setValue] = React.useState(0);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	async function loadDepsFromStore() {
		loadFromStore("").then((flats) => flatsStore.setDeps(flats || []));
		loadLicensesFromStore("").then((flats) =>
			flatsLicenseStore.setDeps(flats || []),
		);
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

				<Box sx={{ width: "100%" }}>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={value}
							onChange={handleChange}
							aria-label="basic tabs example"
						>
							<Tab label="Overview" {...a11yProps(0)} />
							<Tab label="Licenses" {...a11yProps(1)} />
						</Tabs>
					</Box>
					<CustomTabPanel value={value} index={0}>
						<FlatDepCompOrNothing />
					</CustomTabPanel>
					<CustomTabPanel value={value} index={1}>
						<LicenseDepCompOrNothing />
					</CustomTabPanel>
				</Box>

				<Drawer open={openx} anchor="right" onClose={toggleDrawer(false)}>
					<Import />
				</Drawer>
			</div>
		</>
	);
}

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
