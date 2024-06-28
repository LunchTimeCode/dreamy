import { Box, Card, TextField } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useFlatDeps } from "./FlatStore.ts";
import { type FlatDep, flatDepKey } from "./Represenation.ts";

function FlatDepComp(props: {
	value: string;
	setSearchValue: (searchVal: string) => void;
}) {
	const flats = useFlatDeps();

	return (
		<>
			<Card variant="elevation">
				<Box sx={{ width: "100%", marginTop: 2 }}>
					<TextField
						id="outlined-basic"
						label="Search Dependency"
						variant="outlined"
						value={props.value}
						onChange={(v) => {
							props.setSearchValue(v.target.value);
						}}
					/>
				</Box>
				<Box sx={{ height: 700, width: "100%" }}>
					<DataGrid
						rows={flats.flats}
						columns={columns}
						density="compact"
						disableRowSelectionOnClick
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
];

export function FlatDepCompOrNothing(props: {
	value: string;
	setSearchValue: (searchVal: string) => void;
}) {
	return (
		<FlatDepComp value={props.value} setSearchValue={props.setSearchValue} />
	);
}
