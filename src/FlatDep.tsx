import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Card, TextField } from "@mui/material";
import {
	DataGrid,
	GridActionsCellItem,
	type GridColDef,
	GridToolbarContainer,
	GridToolbarExport,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useFlatDeps } from "./FlatStore.ts";
import { type FlatDep, flatDepKey } from "./Represenation.ts";
import {
	deleteLocalAndMemoryDep,
	loadFromLocal,
	loadFromStore,
} from "./commands.ts";

function FlatDepComp() {
	const flatsStore = useFlatDeps();
	const [searchStringState, setSearchStringState] = useState<string>("");

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

	function deleteSelection(id: string) {
		deleteLocalAndMemoryDep(id).then(() => {
			loadFromLocal().then(() => {
				loadFromStore("").then((flats) => flatsStore.setDeps(flats || []));
			});
		});
	}

	const actionCols: GridColDef<FlatDep> = {
		field: "actions",
		type: "actions",
		headerName: "Actions",
		width: 100,
		cellClassName: "actions",
		getActions: ({ id }) => {
			return [
				<GridActionsCellItem
					icon={<DeleteIcon />}
					key={id}
					label="Delete"
					onClick={() => deleteSelection(id.toString())}
					color="inherit"
				/>,
			];
		},
	};

	return (
		<>
			<Card variant="elevation">
				<Box sx={{ width: "100%", marginTop: 2 }}>
					<TextField
						id="outlined-basic"
						label="Search Dependency"
						variant="outlined"
						value={searchStringState}
						onChange={(v) => {
							debouncedReloadAndSearch(v.target.value);
						}}
					/>
				</Box>
				<Box sx={{ height: 700, width: "100%" }}>
					<DataGrid
						rows={flatsStore.flats}
						columns={columns.concat(actionCols)}
						density="compact"
						slots={{
							toolbar: CustomToolbar,
						}}
						getRowId={(row) => flatDepKey(row)}
					/>
				</Box>
			</Card>
		</>
	);
}

const columns: GridColDef<FlatDep>[] = [
	{
		field: "uuid",
		headerName: "Id",
		width: 100,
		editable: false,
	},
	{
		field: "extractionTimeHuman",
		headerName: "Extraction Time (UTC)",
		width: 100,
		editable: false,
	},
	{
		field: "org",
		headerName: "Organization",
		width: 200,
		editable: false,
	},
	{
		field: "repo",
		headerName: "Repo",
		width: 150,
		editable: false,
	},
	{
		field: "packageType",
		headerName: "Type",
		width: 150,
		editable: false,
	},
	{
		field: "depName",
		headerName: "Dependency",
		width: 300,
		editable: false,
	},
	{
		field: "currentValue",
		headerName: "Version",
		width: 200,
		editable: false,
	},
	{
		field: "license",
		headerName: "License",
		width: 200,
		editable: false,
	},
];

export function FlatDepCompOrNothing() {
	return <FlatDepComp />;
}

function CustomToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarExport csvOptions={{ allColumns: true }} />
		</GridToolbarContainer>
	);
}
