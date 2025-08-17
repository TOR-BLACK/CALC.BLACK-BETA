import { useContext } from "react";
import StoreContext from "./provider";

const useStore = () => useContext(StoreContext);

export default useStore;
