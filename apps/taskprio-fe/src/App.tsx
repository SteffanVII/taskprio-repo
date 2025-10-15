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
import { ThemeProvider } from './lib/utils/themeProvider'
import ProjectSettingsPage from './routes/private/project/settings/projectSettingsPage'
import ProfilePage from './routes/private/profile/profilePage'
import TaskTodoPage from './routes/private/taskTodo/taskTodoPage'
import MousePositionProvider from './lib/utils/mousePositionProvider'
import WorkspaceSettingsPage from './routes/private/workspace/settings/workspaceSettingsPage'
import { Toaster } from './components/ui/sonner'

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
				path : "accept",
				element : <AcceptRoute/>
			},
			{
				path : "p",
				element : <PrivateLayout/>,
				children : [
					{
						path : "w/:workspace_id?",
						element : <MainPage/>,
						children : [
							{
								path : "d/:project_id?",
								element : <ProjectPage/>,
								children : [
									{
										path : "t/:task_board_id?/:task_id?",
										element : <TaskboardPage/>
									},
									{
										path : "project_settings",
										element : <ProjectSettingsPage/>
									}
								]
							},
							{
								path : "tt",
								element : <TaskTodoPage/>
							},
							{
								path : "workspace_settings",
								element : <WorkspaceSettingsPage/>
							}
						]
					},
					{
						path : "profile",
						element : <ProfilePage/>
					}
				]
			}
		]
	}
])

function App() {

	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme' >
			<MousePositionProvider>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</MousePositionProvider>
			<Toaster
				position="top-center"
			/>
		</ThemeProvider>
	)
}

export default App
