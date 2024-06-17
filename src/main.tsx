import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import ReactDOM from "react-dom/client";
import App from "./App";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#ba68c8",
		},
		secondary: {
			main: "#8e24aa",
		},
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<ThemeProvider theme={darkTheme}>
		<CssBaseline />
		<App />
	</ThemeProvider>,
);
