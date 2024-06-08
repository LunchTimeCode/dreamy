import { Box, Card, CardHeader } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

function RepoComp(props: { repo: readonly Repo[]; orgName: string }) {
  const enhanced: Dep[] = props.repo
    .map((repo) => {
      if (repo.packageData) {
        if (Object.keys(repo.packageData ?? {}).length === 0) {
          console.log("empty pkgs", repo);
          return [];
        } else {
          const pkgs: Dep[] = [];
          console.log("trying to get pkgs", repo);
          console.log("trying to get type", repo.packageData);

          new Array(...Object.entries(repo.packageData)).forEach((value) => {
            const depGroupName: string = value[0];
            const groups: DepGroup[] | undefined = value[1];
            if (groups) {
              pkgs.push(...packages(depGroupName, groups, repo.repo));
            }
          });
          return pkgs;
        }
      }

      return [];
    })
    .flat();

  return (
    <>
      <Card variant="elevation">
        <CardHeader title="Depenencies" />
        <Box sx={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={enhanced}
            columns={columns}
            initialState={{}}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            getRowId={(row) =>
              row.repo + row.depName + row.currentValue + row.packageName
            }
          />
        </Box>
      </Card>
    </>
  );
}

function packages(
  packageName: string,
  packageGroups: DepGroup[],
  repo: string,
) {
  if (packageGroups) {
    return packageGroups
      .map((value) => {
        const deps = value.deps;
        return deps.map((dep) => {
          const enhancedDep: Dep = {
            packageName: packageName,
            depName: dep.depName,
            currentValue: dep.currentValue,
            repo,
          };
          return enhancedDep;
        });
      })
      .flat();
  } else {
    return [];
  }
}

export function OrgComp(props: { orgWrapper: OrgWrapper }) {
  const orgName = props.orgWrapper.organisation;
  const repos = props.orgWrapper.repos;
  return (
    <>
      <RepoComp repo={repos} orgName={orgName}></RepoComp>
    </>
  );
}

const columns: GridColDef<Dep>[] = [
  {
    field: "repo",
    headerName: "Repo",
    width: 200,
    editable: false,
  },
  {
    field: "packageName",
    headerName: "package type",
    width: 200,
    editable: false,
  },
  {
    field: "depName",
    headerName: "dependency",
    width: 250,
    editable: false,
  },
  {
    field: "currentValue",
    headerName: "version",
    width: 200,
    editable: false,
  },
];

export function CompOrNothing(props: { w: OrgWrapper | undefined }) {
  if (props.w) {
    return <OrgComp orgWrapper={props.w} />;
  } else {
    return <p>{props.w}</p>;
  }
}
