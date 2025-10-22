import React, { useState, useEffect, useCallback } from "react";
import {
  Form, Input, Button, Card, Space, message, DatePicker, Select, Upload,
} from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, } from "@ant-design/icons";
import { draftApproval, submitDocument, uploadFile, resubmitDocument } from "../../../api/groupware/approvalApi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchEmployees } from "../../../api/hr/employeeApi";
import { useSelector } from "react-redux";
// ✅ 문서유형별 하위 폼 import
import RequestForm from "./forms/RequestForm";
import ProjectPlanForm from "./forms/ProjectPlanForm";
import EstimateProposalForm from "./forms/EstimateProposalForm";
import ExpenseForm from "./forms/ExpenseForm";
import PurchaseForm from "./forms/PurchaseForm";
import LeaveForm from "./forms/LeaveForm";
import ResignationForm from "./forms/ResignationForm";
import HRMoveForm from "./forms/HRMoveForm";
import { fetchDepartments } from "../../../api/hr/departmentsAPI";
import { fetchAutoApprovalLine, fetchDocumentTypes } from "../../../api/groupware/policyApi";

const { Option } = Select;


const formTypes = {
  REQUEST: RequestForm,
  PROJECT_PLAN: ProjectPlanForm,
  ESTIMATE_PROPOSAL: EstimateProposalForm,
  EXPENSE: ExpenseForm,
  PURCHASE: PurchaseForm,
  LEAVE: LeaveForm,
  RESIGN: ResignationForm,
  HR_MOVE: HRMoveForm,
};

const ApprovalForm = ({ isResubmit = false, initialData = null, onSuccess }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { docId } = useParams();
  const location = useLocation();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [docData, setDocData] = useState({});
  const [docType, setDocType] = useState(null);
  const [autoApprovalLine, setAutoApprovalLine] = useState([]);
  const [manualMode, setManualMode] = useState(true);


  const token = localStorage.getItem("token");

  /* ===========================================================
    ✅ 직원 목록 & 부서 목록 로드
 =========================================================== */
  useEffect(() => {
    (async () => {
      try {
        const [emps, depts] = await Promise.all([
          fetchEmployees(),
          fetchDepartments(),
        ]);
        setEmployeeOptions(
          emps.map((e) => ({
            label: `${e.empName} (${e.deptName})`,
            value: e.empNo,
          }))
        );
        setDepartmentOptions(
          depts.map((d) => ({ label: d.deptName, value: d.deptName }))
        );
      } catch (err) {
        console.error(err);
        message.error("기초 데이터를 불러올 수 없습니다.");
      }
    })();
  }, []);

  /* ===========================================================
   ✅ 문서유형 목록 로드 (Enum 자동 연동)
=========================================================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDocumentTypes();
        console.log("📄 문서유형 응답:", res);

        // ✅ 응답 구조에 따라 배열 부분 추출
        const data =
          Array.isArray(res) ? res :
            Array.isArray(res.data) ? res.data :
              Array.isArray(res.data?.data) ? res.data.data :
                [];

        const formatted = data.map((t) => ({
          label: t.label || t.name || t.code,
          value: t.code || t.value || t.id,
        }));

        setDocumentTypes(formatted);
        console.log("✅ 문서유형 목록:", formatted);
      } catch (err) {
        console.error("❌ 문서유형 로드 실패:", err);
        message.error("문서유형 정보를 불러오지 못했습니다.");
      }
    })();
  }, []);

  /* ===========================================================
     ✅ 재상신 데이터 로드
  =========================================================== */
  useEffect(() => {
    if (isResubmit) {
      const data = initialData || location.state;
      if (data) {
        form.setFieldsValue({
          title: data.title,
          docType: data.docType,
        });
        setDocData(data.docContent || {});
        setUploadedFiles(data.attachments || []);
        setFileList(
          (data.attachments || []).map((f) => ({
            uid: f.id,
            name: f.originalName,
            status: "done",
            url: f.filePath,
          }))
        );
        setDocType(data.docType);
      }
    }
  }, [isResubmit, initialData, location.state]);

  /* ===========================================================
     ✅ 파일 업로드 (문서ID 없어도 임시 업로드 가능)
     =========================================================== */
  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    console.log("📤 업로드 시작:", file.name, form);
    setUploading(true);

    try {
      const uploaded = await uploadFile(file, docId || null);

      setUploadedFiles((prev) => [...prev, uploaded]);
      setFileList((prev) => [
        ...prev,
        {
          uid: uploaded.id,
          name: uploaded.originalName,
          status: "done",
          url: uploaded.filePath,
        },
      ]);
      form.setFieldsValue({
        attachments: [...(form.getFieldValue("attachments") || []), uploaded],
      });

      // ✅ 반드시 호출해야 Upload 내부 상태가 바뀜
      onSuccess("ok");

      message.success(`${file.name} 업로드 성공`);
      console.log("✅ 업로드 성공:", uploaded);
    } catch (err) {
      console.error("❌ 업로드 에러:", err);
      onError(err);
      message.error(`${file.name} 업로드 실패`);
    } finally {
      // ✅ 0.3초 정도 딜레이를 두고 상태 초기화 (UI 안정화)
      setTimeout(() => setUploading(false), 300);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
    console.log("📂 fileList 변경됨:", fileList);
  }

  const handleFileRemove = (file) => {
    setUploadedFiles((prev) =>
      prev.filter((f) => f.originalName !== file.name)
    );
    form.setFieldsValue({
      attachments: uploadedFiles.filter((f) => f.originalName !== file.name),
    });
  };
  /* ===========================================================
     ✅ 임시저장 / 상신 처리
     =========================================================== */
  const handleAction = useCallback(
    async (actionType) => {
      if (uploading) {
        message.warning("파일 업로드 중입니다. 잠시만 기다려주세요.");
        return;
      }

      setLoading(true);
      try {
        const values = await form.validateFields();
        if (!currentUser) throw new Error("로그인 정보 없음");

        const attachments = uploadedFiles.map((f) => ({
          id: f.id,
          originalName: f.originalName,
          storedName: f.storedName,
          filePath: f.filePath,
          fileSize: f.fileSize,
          contentType: f.contentType,
        }));

        const viewerIds = form.getFieldValue("viewerIds") || [];

        const data = {
          title: values.title,
          docType: values.docType,
          status:
            actionType === "draft"
              ? "DRAFT"
              : "IN_PROGRESS",
          docContent: docData,

          // ✅ 자동/수동 결재선 분기 처리 추가
          approvalLine: manualMode
            ? (values.approvalLine || []).map((a, i) => {
              const selectedEmp = employeeOptions.find(
                (emp) => emp.value === a.approverId
              );
              const approverName = selectedEmp
                ? selectedEmp.label.split("(")[0].trim()
                : "미등록 사용자";
              return {
                order: i + 1,
                approverId: a.approverId,
                approverName,
                decision: "PENDING",
                comment: "",
              };
            })
            : (autoApprovalLine || []).map((a) => ({
              order: a.stepOrder,
              approverId: a.empId || "-",     // 정책 기반이라 empId가 존재할 수도 있음
              approverName: a.empName,
              decision: "PENDING",
              comment: "",
            })),

          attachments,
          viewerIds,
          empId: currentUser.empId,
          username: currentUser.username,
          userId: currentUser.userId,
          empName: currentUser.empName,
          deptName: currentUser.deptName,
        };

        console.log("📄 전송 데이터:", data);

        let response;
        if (actionType === "draft") response = await draftApproval(data);
        else if (actionType === "resubmit")
          response = await resubmitDocument(docId, data);
        else response = await submitDocument(data);

        if (response?.id) {
          message.success(
            `${actionType === "draft" ? "임시저장" : "상신"} 완료되었습니다 ✅`
          );
          onSuccess();
        } else {
          message.warning("서버 응답에 문서 ID가 없습니다.");
        }
      } catch (err) {
        console.error("❌ 문서 저장 실패:", err);
        message.error("문서 저장 중 오류 발생 ❌");
      } finally {
        setLoading(false);
      }
    },
    [uploading, uploadedFiles, currentUser, docData, employeeOptions, form, navigate, docId]
  );

  /* ===========================================================
     ✅ 렌더링
     =========================================================== */

  const DynamicForm = formTypes[docType];

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{isResubmit ? "🔁 반려 문서 재상신" : "전자결재 작성"}</span>
          {currentUser && (
            <span style={{ fontSize: "0.9rem", color: "#888" }}>
              ✍ {currentUser.empName} {currentUser.username} 님, 작성 중입니다.
            </span>
          )}
        </div>
      }
      variant="borderless"
      style={{ marginBottom: 24 }}
    >
      <Form form={form} layout="vertical">
        {/* 문서 유형 */}
        <Form.Item
          label="문서 유형"
          name="docType"
          rules={[{ required: true, message: "문서 유형을 선택하세요." }]}
        >
          <Select
            placeholder="문서 유형을 선택하세요"
            onChange={async (value) => {
              setDocType(value);
              setDocData({});

              try {
                const deptCode = currentUser.departmentCode;
                const res = await fetchAutoApprovalLine(value, deptCode);
                console.log("📡 자동결재선 응답:", res);

                // ✅ 응답 구조 확인 (배열인지, data.data인지)
                const steps =
                  Array.isArray(res.data) ? res.data :
                    Array.isArray(res.data?.data) ? res.data.data :
                      [];

                if (steps.length > 0) {
                  setAutoApprovalLine(steps);
                  setManualMode(false); // 🔥 자동모드 활성화
                  form.setFieldsValue({ approvalLine: steps });
                  message.success("결재정책이 적용되어 자동으로 결재선이 설정되었습니다.");
                } else {
                  setAutoApprovalLine([]);
                  setManualMode(true); // 🔥 수동모드 활성화
                  form.setFieldsValue({ approvalLine: [] });
                  message.info("결재정책이 없어 수동 결재선 설정이 필요합니다.");
                }
              } catch (err) {
                console.error("❌ 자동 결재선 조회 실패:", err);
                setManualMode(true);
                message.error("결재정책을 불러오지 못했습니다.");
              }
            }}
            options={documentTypes} // ✅ 자동 로드된 Enum 기반 옵션
            loading={documentTypes.length === 0}
          />
        </Form.Item>

        {/* 제목 */}
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: "제목을 입력해주세요." }]}
        >
          <Input placeholder="제목 입력" />
        </Form.Item>

        {/* ✅ 문서유형별 세부 입력폼 */}
        {DynamicForm && (
          <DynamicForm
            value={docData}
            onChange={(newValue) =>
              setDocData((prev) => ({
                ...prev,
                ...newValue, // 🔥 기존 상태 유지 + 변경값 반영
              }))
            }
            currentUser={currentUser}
            employeeOptions={employeeOptions}
            departmentOptions={departmentOptions}
          />
        )}

        {/* 결재자 라인 */}
        {!manualMode ? (
          <>
            <label style={{ fontWeight: "bold" }}>결재선 (정책 자동 적용)</label>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "#1677ff" }}>
                이 문서유형은 회사 결재정책에 따라 자동으로 설정됩니다.
              </span>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #d9d9d9",
              }}
            >
              <thead style={{ background: "#fafafa" }}>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 6 }}>순서</th>
                  <th style={{ border: "1px solid #ddd", padding: 6 }}>부서</th>
                  <th style={{ border: "1px solid #ddd", padding: 6 }}>직위</th>
                  <th style={{ border: "1px solid #ddd", padding: 6 }}>결재자</th>
                </tr>
              </thead>
              <tbody>
                {autoApprovalLine.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                      {s.stepOrder}
                    </td>
                    <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                      {s.deptName}
                    </td>
                    <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                      {s.positionName}
                    </td>
                    <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                      {s.empName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          // 🔽 기존 수동 결재선 Form.List 유지
          <Form.List
            name="approvalLine"
            initialValue={[]}
            rules={[
              {
                validator: async (_, line) => {
                  if (!line || line.length < 1) {
                    return Promise.reject(
                      new Error("결재자를 최소 1명 이상 추가하세요.")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                <label style={{ fontWeight: "bold" }}>결재자 라인 (수동 설정)</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      justifyContent: "space-between",
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "approverId"]}
                      rules={[{ required: true, message: "결재자를 선택하세요." }]}
                      style={{ flex: 1, minWidth: "200px" }}
                    >
                      <Select
                        placeholder="결재자 선택"
                        options={employeeOptions}
                        showSearch
                        filterOption={(input, option) =>
                          option?.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    결재자 추가
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        )}
        {/* 열람자 */}
        <Form.Item label="열람자" name="viewerIds">
          <Select
            mode="multiple"
            placeholder="열람자를 선택하세요"
            options={employeeOptions}
            showSearch
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* 첨부파일 */}
        <Form.Item label="첨부파일">
          <Upload
            name="file"
            customRequest={handleFileUpload}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            headers={{ Authorization: `Bearer ${token}` }}
            fileList={fileList}
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.hwp"
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              {uploading ? "업로드 중..." : "파일 업로드"}
            </Button>
          </Upload>
        </Form.Item>

        {/* 버튼 */}
        <Space>
          <Button
            type="default"
            htmlType="button"
            onClick={() => handleAction("draft")}
            loading={loading || uploading}
            disabled={uploading}
          >
            임시저장
          </Button>
          <Button
            type="primary"
            htmlType="button"
            onClick={() =>
              handleAction(isResubmit ? "resubmit" : "submit")
            }
            loading={loading || uploading}
            disabled={uploading}
          >
            {isResubmit ? "재상신" : "상신"}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ApprovalForm;
