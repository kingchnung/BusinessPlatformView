import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Table, Tag, Typography, Row, Col, Input, Select, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { fetchActiveProjects } from "../../../api/work/projectApi"; // GET /api/projects (진행중만)
import { useEmployees } from "../../../hr/hooks/useEmployees";
import { useDepartments } from "../../../hr/hooks/useDepartments";
import { divideDepartmentsByCode } from "../../../hr/util/departmentDivision";


const { Text } = Typography;
const { Search } = Input;

const UserProjectListPage = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [deptId, setDeptId] = useState();

    const { employees, loading: empLoading } = useEmployees();
    const { departments, loading: deptLoading } = useDepartments();
    const busy = loading || empLoading || deptLoading;

    // ✅ 부서 목록에서 '팀'만 추출
    const teamDepartments = useMemo(() => {
        const { teams } = divideDepartmentsByCode(departments || []);
        return teams;
    }, [departments]);

    // ✅ 선택된 값이 '부(division)'이었던 경우 초기화
    useEffect(() => {
        if (!deptId) return;
        const stillExists = teamDepartments.some((d) => d.deptId === deptId);
        if (!stillExists) setDeptId(undefined);
    }, [teamDepartments, deptId]);

    // PM 이름: pmId 없으면 부서장(managerId)로 대체 표시
    const getPmName = useCallback(
        (pmId, record) => {
            const fallbackId = record?.department?.managerId;
            const targetId = pmId ?? fallbackId;
            if (!targetId || !employees.length) return "-";
            const pm = employees.find((e) => e.empId === targetId);
            return pm ? pm.empName : "-";
        },
        [employees]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchActiveProjects(); // 진행 중만
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            message.error("프로젝트 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let res = [...projects];
        if (deptId) res = res.filter((p) => p.department?.deptId === deptId);
        if (keyword?.trim()) {
            const k = keyword.trim().toLowerCase();
            res = res.filter((p) =>
                [p.projectName, p.department?.deptName, p.pmName]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(k))
            );
        }
        return res;
    }, [projects, deptId, keyword]);

    const columns = useMemo(
        () => [
            {
                title: "프로젝트명",
                dataIndex: "projectName",
                key: "projectName",
                render: (text, record) => (
                    <Text
                        strong
                        style={{ cursor: "pointer", color: "#1677ff" }}
                        onClick={() => navigate(`/work/project/detail/${record.projectId}`)}
                    >
                        {text}
                    </Text>
                ),
            },
            {
                title: "담당 부서",
                dataIndex: ["department", "deptName"],
                key: "department",
                render: (text) => text || <Tag color="default">미지정</Tag>,
            },
            {
                title: "PM",
                dataIndex: "pmId",
                key: "pm",
                render: (pmId, record) => getPmName(pmId, record),
            },
            {
                title: "기간",
                key: "period",
                render: (_, r) =>
                    `${dayjs(r.startDate).format("YY.MM.DD")} ~ ${dayjs(r.endDate).format("YY.MM.DD")}`,
            },
            {
                title: "예산",
                dataIndex: "totalBudget",
                key: "totalBudget",
                align: "right",
                render: (v) => (v ? v.toLocaleString() + " ₩" : "-"),
            },
            {
                title: "상태",
                dataIndex: "status",
                key: "status",
                render: (s) => {
                    const map = {
                        PLANNING: { color: "orange", label: "기획중" },
                        IN_PROGRESS: { color: "green", label: "진행중" },
                        COMPLETED: { color: "blue", label: "완료" },
                        CANCELED: { color: "default", label: "종료" },
                    };
                    const m = map[s] || { color: "default", label: s || "-" };
                    return <Tag color={m.color}>{m.label}</Tag>;
                },
            },
        ],
        [getPmName, navigate]
    );

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Text strong style={{ fontSize: 18 }}>📋 진행 중 프로젝트</Text>
                </Col>
                <Col>
                    <Space size="middle">
                         <Select
                            allowClear
                            placeholder="팀 선택"
                            value={deptId}
                            onChange={setDeptId}
                            style={{ width: 220 }}
                            options={teamDepartments.map((d) => ({
                                value: d.deptId,
                                label: d.deptName,
                            }))}
                        />
                        <Search
                            allowClear
                            placeholder="프로젝트명/부서/PM 검색"
                            onSearch={setKeyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{ width: 260 }}
                        />
                    </Space>
                </Col>
            </Row>

            <Table
                rowKey="projectId"
                dataSource={filtered}
                columns={columns}
                loading={busy}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "진행 중인 프로젝트가 없습니다." }}
            />
        </div>
    );
};

export default UserProjectListPage;