import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MockLoginPage() {
  const navigate = useNavigate();

  const handleMockLogin = async () => {
    const res = await axios.post("http://localhost:8080/api/mock/login", { username: "tester" });
    localStorage.setItem("token", res.data.token);
    alert("로그인 성공: " + res.data.username);
    navigate("/approvals");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>BizMate Mock 로그인</h2>
      <p>임시 계정으로 전자결재를 테스트할 수 있습니다.</p>
      <button onClick={handleMockLogin}>Mock 로그인 실행</button>
    </div>
  );
}