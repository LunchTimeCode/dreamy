import { Box, Card, CardHeader } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

function FlatDepComp(props: { flatDep: readonly FlatDep[] }) {
  return (
    <>
      <Card variant="elevation">
        <CardHeader title="Depenencies" />
        <Box sx={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={props.flatDep}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            getRowId={(row) =>
              row.repo + row.org + row.currentValue + row.depName
            }
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

export function FlatDepCompOrNothing(props: { w: FlatDep[] | undefined }) {
  if (props.w) {
    return <FlatDepComp flatDep={props.w} />;
  } else {
    return <p>{props.w}</p>;
  }
}
