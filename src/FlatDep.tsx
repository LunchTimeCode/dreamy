import { Box, Card, CardHeader, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FlatDep, flatDepKey } from "./Represenation.ts";

function FlatDepComp(props: {
  flatDep: readonly FlatDep[];
  setSearchValue: (searchVal: string) => void;
}) {
  return (
    <>
      <Card variant="elevation">
        <CardHeader title="Depenencies" />
        <TextField
          id="outlined-basic"
          label="Search Dependency"
          variant="outlined"
          onChange={(v) => {
            props.setSearchValue(v.target.value);
          }}
        />
        <Box sx={{ height: 700, width: "100%" }}>
          <DataGrid
            rows={props.flatDep}
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
  w: FlatDep[] | undefined;
  setSearchValue: (searchVal: string) => void;
}) {
  if (props.w) {
    return (
      <FlatDepComp flatDep={props.w} setSearchValue={props.setSearchValue} />
    );
  } else {
    return <p>{props.w}</p>;
  }
}
