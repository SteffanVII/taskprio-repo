import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import LoginRoute from './routes/public/login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthLayout from './routes/layouts/authLayout'
import PrivateLayout from './services/private/PrivateLayout'
import ProjectPage from './routes/private/project/projectPage'
import MainPage from './routes/private/mainPage'
import TaskboardPage from './routes/private/project/taskboard/taskboardPage'
import AcceptRoute from './routes/public/accept'

const queryClient = new QueryClient()

const router = createBrowserRouter([
	{
		path : "/",
		element : <AuthLayout/>,
		children : [
			{
				path : "login",
				element : <LoginRoute />
			},
			{
				path : "p",
				element : <PrivateLayout/>,
				children : [
					{
						path : "w/:workspace_slug?",
						element : <MainPage/>,
						children : [
							{
								path : "d/:project_slug?",
								element : <ProjectPage/>,
								children : [
									{
										path : "t/:task_board_slug?/:task_id?",
										element : <TaskboardPage/>
									}
								]
							}
						]
					},
                    {
                        path : "accept",
                        element : <AcceptRoute/>
                    }
				]
			},
		]
	}
])

function App() {

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	)
}

export default App
