
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import { Provider } from 'react-redux';
import store from './store';

import { message } from 'antd';

// message 컴포넌트의 전역 설정을 추가합니다.
// 모달의 z-index(기본값 1000)보다 높은 값으로 설정합니다.
message.config({
  zIndex: 2000, // 모달보다 높은 z-index 값
  duration: 3,   // 메시지 표시 시간 (초)
  top: 80, // 메시지가 화면 상단에서 얼마나 떨어져서 나올지 (선택 사항)
});


const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  )
};

export default App
