import React, { useState, useEffect } from "react";
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

const { TextArea } = Input;

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

const ApprovalForm = ({ isResubmit = false, initialData = null }) => {
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
  const [docData, setDocData] = useState({});
  const [docType, setDocType] = useState(null);
  const token = localStorage.getItem("token");

  /* ===========================================================
     ✅ 직원 목록 로드
     =========================================================== */
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        const options = data.map((emp) => ({
          label: `${emp.empName} (${emp.deptName})`,
          value: emp.empNo,
        }));
        setEmployeeOptions(options);
      } catch (err) {
        console.error("직원 목록 조회 실패:", err);
        message.error("직원 정보를 불러올 수 없습니다.");
      }
    };
    loadEmployees();
  }, []);

  // ✅ 부서 목록 로드
  useEffect(() => {
  const loadDepartments = async () => {
    try {
      const data = await fetchDepartments();
      const options = data.map((dept) => ({
        label: dept.deptName,
        value: dept.deptName, // 또는 dept.deptId 사용 가능
      }));
      setDepartmentOptions(options);
    } catch (err) {
      console.error("부서 목록 조회 실패:", err);
      message.error("부서 정보를 불러올 수 없습니다.");
    }
  };
  loadDepartments();
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
        setDocType(data.docType);
      }
    }
  }, [isResubmit, initialData, location.state]);

  /* ===========================================================
     ✅ 파일 업로드 (문서ID 없어도 임시 업로드 가능)
     =========================================================== */
  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    console.log("📤 업로드 시작:", file.name);
    setUploading(true);

    try {
      const uploaded = await uploadFile(file, currentDocId || null);

      setUploadedFiles((prev) => [...prev, uploaded]);

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
  /* ===========================================================
     ✅ 임시저장 / 상신 처리
     =========================================================== */
  const handleAction = async (type) => {
    console.log("▶️ handleAction 시작:", type);

    if (uploading) {
      message.warning("파일 업로드 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 1️⃣ 유효성 검증
      const values = await form.validateFields().catch((err) => {
        console.error("❌ 필드 검증 실패:", err);
        message.error("필수 항목을 모두 입력해주세요.");
        throw err;
      });

      if (!currentUser) {
        message.error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }

      const DynamicFormValues = docData; // ✅ 하위 폼의 입력데이터

      // ✅ 2️⃣ 업로드된 파일 DTO 변환
      const pureAttachments = uploadedFiles.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        filePath: file.filePath,
        fileSize: file.fileSize,
        contentType: file.contentType,
      }));

      // ✅ 3️⃣ 서버 전송용 데이터 구성
      const data = {
        title: values.title,
        docType: values.docType,
        status: type === "draft" ? "DRAFT" : "SUBMITTED",
        docContent: DynamicFormValues, // ✅ 유형별 데이터,

        approvalLine: (values.approvalLine || [])
          .filter((a) => a.approverId) // ✅ 빈 값 방지
          .map((a, idx) => {
            // ✅ employeeOptions에서 approverId(=사번)로 해당 직원 찾기
            const selectedEmp = employeeOptions.find(
              (emp) => emp.value === a.approverId
            );

            // ✅ "이회계 (회계부)" → "이회계"만 추출
            const approverName = selectedEmp
              ? selectedEmp.label.split("(")[0].trim()
              : "미등록 사용자";

            return {
              order: idx + 1,
              approverId: a.approverId,
              approverName, // ✅ 결재자 이름을 직접 세팅
              decision: "PENDING",
              comment: "",
            };
          }),

        attachments: pureAttachments,

        empId: currentUser.empId,
        username: currentUser.username,
        userId: currentUser.userId,
        roleId: currentUser.roleId || null,
        departmentId: currentUser.departmentId || null,
        empName: currentUser.empName,
      };

      console.log("📄 문서 생성 데이터:", data);
      console.log("📤 서버 요청 시작:", type, data);

      // ✅ 4️⃣ 서버 요청
      const res =
        type === "draft"
          ? await draftApproval(data)
          : type === "resubmit"
            ? await resubmitDocument(docId, data)
            : await submitDocument(data);

      // ✅ 5️⃣ 결과 처리
      if (res?.id) {
        setCurrentDocId(res.id);
        message.success(`${type === "draft" ? "임시저장" : "상신"} 완료`);
      } else {
        message.warning("서버 응답에 문서 ID가 없습니다.");
      }

      // ✅ 6️⃣ 폼 초기화
      form.resetFields();
      setFileList([]);
      setUploadedFiles([]);
      setCurrentDocId(null);

      // ✅ 7️⃣ 페이지 이동
      navigate("/approvals");
    } catch (err) {
      console.error("❌ handleAction 오류:", err);
      if (err.response) {
        console.error("🔍 서버 응답:", err.response);
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

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
            onChange={(value) => setDocType(value)}
            options={[
              { label: "기안서(품의서)", value: "REQUEST" },
              { label: "프로젝트 기획안/품의서", value: "PROJECT_PLAN" },
              { label: "견적서/제안서 발송 품의", value: "ESTIMATE_PROPOSAL" },
              { label: "지출결의서", value: "EXPENSE" },
              { label: "구매 품의서", value: "PURCHASE" },
              { label: "휴가 신청서", value: "LEAVE" },
              { label: "사직서", value: "RESIGN" },
              { label: "인사발령", value: "HR_MOVE" },
            ]}
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
            employeeOptions={employeeOptions}
            departmentOptions={departmentOptions}
          />
        )}

        {/* 결재자 라인 */}
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
              <label style={{ fontWeight: "bold" }}>결재자 라인</label>
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
                    style={{ flex: 1, minWidth: '200px' }}
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
