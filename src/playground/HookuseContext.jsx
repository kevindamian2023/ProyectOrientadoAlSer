import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function Hijo() {
  const theme = useContext(ThemeContext);
  return <p>Tema actual: {theme}</p>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Hijo />
    </ThemeContext.Provider>
  );
}
export default App;