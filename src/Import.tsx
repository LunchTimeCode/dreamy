import { Divider, Stack, TextField, Typography } from "@mui/material";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { useFlatDeps, useLicenseFlatDeps } from "./FlatStore.ts";
import {
	loadFromGithub,
	loadFromStore,
	loadGhToken,
	loadIntoStore,
	loadLicensesFromStore,
} from "./commands.ts";

export function Import() {
	const flatsStore = useFlatDeps();
	const flatsLicenseStore = useLicenseFlatDeps();

	const [sourcePath, setSourcePath] = useState("");

	const [token, setToken] = useState<string>("");
	const [org, setOrg] = useState<string>("");

	async function loadDepsFromStore() {
		loadFromStore("").then((flats) => flatsStore.setDeps(flats || []));
		loadLicensesFromStore("").then((flats) =>
			flatsLicenseStore.setDeps(flats || []),
		);
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

	return (
		<>
			<div className="container">
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
							type="password"
							variant="filled"
							value={token}
							onChange={(v) => {
								setToken(v.target.value);
							}}
						/>
					</Stack>
					<Button variant="contained" onClick={loadDepsFromGithub}>
						{" "}
						Get dependency graphs{" "}
					</Button>
					<Button
						variant="text"
						onClick={() => {
							loadGhToken().then((token) => {
								if (token === "notoken") {
								} else {
									setToken(token);
								}
							});
						}}
					>
						Get token from environment variable
					</Button>
				</Box>
				<Divider orientation="horizontal" flexItem />

				<Box component="section" sx={{ p: 2, border: "2px solid grey" }}>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Renovate
					</Typography>
					<Button variant="contained" onClick={openDialog}>
						Import from file
					</Button>
				</Box>
			</div>
		</>
	);
}
