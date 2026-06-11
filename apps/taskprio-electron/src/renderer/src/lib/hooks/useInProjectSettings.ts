import { useLocation } from "react-router";


export const useInProjectSettings = () => {

  const location = useLocation();

  return location.pathname.includes('/project_settings');

}

export default useInProjectSettings;