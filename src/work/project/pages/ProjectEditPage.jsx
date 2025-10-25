import { useState, useEffect } from "react";
import { fetchAllProjectsForAdmin  } from "../../../api/work/projectApi";
import ProjectSearchBar from "../../pjcommon/ProjectSearchBar";
import ProjectTableSummary from "../component/ProjectTableSummary";
import ProjectStats from "../component/ProjectStats";
import dayjs from "dayjs";

const ProjectEditPage = () => {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const fetchProjects = async () => {
    const data = await fetchAllProjectsForAdmin ();
    setProjects(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ 검색 필터 로직
  const handleSearch = ({ keyword, status, deptName }) => {
    let result = [...projects];
    if (keyword)
      result = result.filter(
        (p) =>
          p.projectName.includes(keyword) ||
          p.pmName?.includes(keyword)
      );
    if (status) result = result.filter((p) => p.status === status);
    if (deptName)
      result = result.filter((p) => p.department?.deptName.includes(deptName));

    setFiltered(result);
  };

  return (
    <div>
      <ProjectStats projects={filtered} month={dayjs()} />
      <ProjectSearchBar onSearch={handleSearch} />
      <ProjectTableSummary projects={filtered} month={dayjs()} />
    </div>
  );
};

export default ProjectEditPage;
