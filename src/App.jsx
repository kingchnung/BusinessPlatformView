
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import { Provider } from 'react-redux';
import store from './store';



const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  )
};

export default App
