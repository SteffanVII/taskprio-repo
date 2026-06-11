import { useProjectStore_selectedProject } from "@/stores/project"
import { useNavigate } from "react-router"

const useGoToProjectPage = () => {

  const navigate = useNavigate()
  
  const selectedProject = useProjectStore_selectedProject()

  return () => {
    navigate(`/p/w/${selectedProject?.workspace_id}/d/${selectedProject?.project_id}/t`)
  }

}

export default useGoToProjectPage;