import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Card, Typography, Button, message,Row, Col } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// 훅과 유틸리티 import
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { divideDepartmentsByCode, getTeamsByDivisionCode } from '../../util/departmentDivision';

import { createAssignment } from '../../../api/hr/assignmentAPI';

const { Title, Text } = Typography;

const DepartmentAssignPage = () => {
  // 1. 훅을 통해 원본 데이터 가져오기
  const { departments, loading: deptsLoading } = useDepartments();
  const { employees, loading: empsLoading } = useEmployees();

  // 2. 상태 관리
  const [initialData, setInitialData] = useState({}); // 원본 데이터 (취소용)
  const [dndData, setDndData] = useState({});       // 사용자가 변경하는 데이터 (UI용)

  // 3. 원본 데이터를 가공하여 초기 상태 설정 (최초 1회 실행)
  useEffect(() => {
    if (!deptsLoading && !empsLoading) {
      const { teams } = divideDepartmentsByCode(departments);
      const initialLayout = {};
      teams.forEach(team => {
        initialLayout[team.deptId] = employees.filter(emp => emp.deptId === team.deptId);
      });
      setInitialData(initialLayout);
      setDndData(initialLayout);
    }
  }, [deptsLoading, empsLoading, departments, employees]);

  // 4. 드래그가 끝났을 때 실행될 함수 (핵심 로직)
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // 드롭 가능한 영역이 아니면 무시

    // 같은 자리로 이동한 경우 무시
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startTeamId = source.droppableId;
    const endTeamId = destination.droppableId;

    const newDndData = { ...dndData };
    const startTeamMembers = Array.from(newDndData[startTeamId]);
    const [movedEmployee] = startTeamMembers.splice(source.index, 1); // 원래 팀에서 직원 제거

    if (startTeamId === endTeamId) {
      // 같은 팀 내에서 순서만 변경
      startTeamMembers.splice(destination.index, 0, movedEmployee);
      newDndData[startTeamId] = startTeamMembers;
    } else {
      // 다른 팀으로 이동
      const endTeamMembers = Array.from(newDndData[endTeamId] || []);
      endTeamMembers.splice(destination.index, 0, movedEmployee); // 새 팀에 직원 추가
      newDndData[startTeamId] = startTeamMembers;
      newDndData[endTeamId] = endTeamMembers;
    }
    setDndData(newDndData);
  };
  
  // 5. '저장' 버튼 클릭 핸들러
  const handleSave = async () => {
    console.log("--- '저장' 버튼 클릭 ---");
    console.log("현재 UI 데이터 (dndData):", dndData);
    console.log("원본 데이터 (initialData):", initialData);

    const changes = [];
    const movedEmployees =  new Set();
    // initialData와 dndData를 비교하여 변경된 직원 찾기
    Object.keys(dndData).forEach(teamId => {
      dndData[teamId].forEach(employee => {
        if (movedEmployees.has(employee.empId)) return;

        const initialTeamId = Object.keys(initialData).find(key => 
          initialData[key].some(emp => emp.empId === employee.empId)
        );


        if (initialTeamId && String(initialTeamId) !== String(teamId)) {

          const newPositionCode = employee.positionCode;
          const newGradeCode = employee.gradeCode;

          if (!newPositionCode || !newGradeCode){
            console.error("오류:  직원정보의 positionCode 또는 gradeCode누락", employee);
            message.error(`${employee.empName} 님의 정보가 누락되었습니다.`);
            return;
          }
          changes.push({
            empId: employee.empId,
            newDeptId: Number(teamId),
            // 기존 position, grade는 그대로 유지
            newPositionCode: newPositionCode,
            newGradeCode: newGradeCode,
            assDate: new Date().toISOString().slice(0, 10), // 오늘 날짜
            reason: '부서 이동'
          });
          movedEmployees.add(employee.empId);
        }
      });
    });

    if (changes.length === 0) {
      message.info('변경사항이 없습니다.');
      return;
    }

    // 변경사항 API 전송 (Promise.all로 병렬 처리)
    try {
      await Promise.all(changes.map(change => createAssignment(change)));
      message.success(`{changes.length}건의 부서 이동이 성공적으로 저장되었습니다.`);
      // 저장 후 초기 상태를 현재 상태로 업데이트
      setInitialData(dndData);
    } catch (error) {
      console.error(error);
    }
  };

  // 6. '취소' 버튼 클릭 핸들러
  const handleCancel = () => {
    setDndData(initialData);
    message.info('모든 변경사항이 취소되었습니다.');
  };
  
  // 데이터 가공 (useMemo로 성능 최적화)
  const { divisions, teams } = useMemo(() => divideDepartmentsByCode(departments), [departments]);

  if (deptsLoading || empsLoading) return <Spin tip="데이터를 불러오는 중입니다..." />;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>부서 이동 관리</Title>
          <div>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>취소</Button>
            <Button type="primary" onClick={handleSave}>저장</Button>
          </div>
        </Row>
        
        {divisions.map(division => (
          <Card key={division.deptId} type="inner" title={division.deptName} style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {getTeamsByDivisionCode(teams, division.deptCode).map(team => (
                <Col key={team.deptId} xs={24} sm={12} md={8}>
                  <Droppable droppableId={String(team.deptId)}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                          padding: 8,
                          minHeight: 100,
                          borderRadius: 4
                        }}
                      >
                        <Title level={5}>{team.deptName}</Title>
                        {(dndData[team.deptId] || []).map((emp, index) => (
                          <Draggable key={emp.empId} draggableId={String(emp.empId)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  userSelect: 'none',
                                  padding: '8px 12px',
                                  margin: '0 0 8px 0',
                                  background: snapshot.isDragging ? '#2E7D32' : 'white',
                                  color: snapshot.isDragging ? 'white' : 'black',
                                  borderRadius: 4,
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div style={{ marginBottom: '4px' }}>
                                  <Text strong style={{ color: snapshot.isDragging ? 'white' : 'inherit' }}>
                                    {emp.empName}
                                  </Text>
                                </div>
                                <div>
                                  <Text type="secondary" style={{ color: snapshot.isDragging ? '#e0e0e0' : 'inherit' }}>
                                    {emp.positionName || '직위 미지정'}
                                  </Text>
                                  <Text type="secondary" style={{ margin: '0 6px', color: snapshot.isDragging ? '#e0e0e0' : 'inherit' }}>
                                    |
                                  </Text>
                                  <Text type="secondary" style={{ color: snapshot.isDragging ? '#e0e0e0' : 'inherit' }}>
                                    {emp.gradeName || '직급 미지정'}
                                  </Text>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </Card>
    </DragDropContext>
  );
};

export default DepartmentAssignPage;